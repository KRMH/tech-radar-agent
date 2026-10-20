import test from 'node:test';
import assert from 'node:assert/strict';
import { createGitHubClient } from '../src/github-client.js';

const now = () => new Date('2026-10-20T12:00:00Z');
const metadata = { html_url: 'https://github.com/octocat/Hello-World', stargazers_count: 10,
  forks_count: 3, open_issues_count: 4, archived: false,
  pushed_at: '2026-10-19T00:00:00Z', default_branch: 'main', private: false };
const commit = i => ({ sha: `sha${i}`, html_url: `https://github.com/octocat/Hello-World/commit/sha${i}`,
  commit: { message: `Commit ${i}`, committer: { date: '2026-10-19T00:00:00Z' } } });
const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), { status, headers });
function fixture(handler) {
  return createGitHubClient({ now, fetchImpl: async (url, options) => handler(new URL(url), options) });
}
const args = { owner: 'octocat', repo: 'Hello-World' };

test('metadata labels issues and pull requests accurately', async () => {
  const r = await fixture(() => json(metadata)).getRepoDetails(args);
  assert.equal(r.open_issues_and_pull_requests_count, 4);
  assert.equal(r.stargazers_count, 10);
  assert.equal(r.default_branch, 'main');
  assert.equal(r.collected_at, '2026-10-20T12:00:00.000Z');
});

test('fixed interval and pagination count all commits, not just the preview', async () => {
  const seen = [];
  const c = fixture((url, opts) => {
    assert.equal(url.origin, 'https://api.github.com');
    assert.equal(opts.headers.Authorization, undefined);
    if (!url.pathname.endsWith('/commits')) return json(metadata);
    seen.push(Object.fromEntries(url.searchParams));
    return url.searchParams.get('page') === '1'
      ? json(Array.from({ length: 100 }, (_, i) => commit(i)), 200,
        { link: '<https://api.github.com/repos/octocat/Hello-World/commits?page=2>; rel="next"' })
      : json([commit(100), commit(101)]);
  });
  const r = await c.getRecentCommits(args);
  assert.equal(r.commits_observed, 102);
  assert.equal(r.commits_per_day, 3.4);
  assert.equal(r.recent_commits.length, 10);
  assert.equal(r.complete, true);
  assert.equal(r.since, '2026-09-20T12:00:00.000Z');
  assert.equal(r.until, '2026-10-20T12:00:00.000Z');
  assert.equal(r.includes_merge_commits, true);
  assert.equal(seen.length, 2);
  assert.equal(seen[1].since, '2026-09-20T12:00:00.000Z');
  assert.equal(seen[1].sha, 'main');
});

test('custom period uses the requested denominator', async () => {
  const r = await fixture(url => json(url.pathname.endsWith('/commits') ? [commit(1), commit(2)] : metadata))
    .getRecentCommits({ ...args, days: 1 });
  assert.equal(r.commits_per_day, 2);
  assert.equal(r.since, '2026-10-19T12:00:00.000Z');
});

for (const value of ['', '..', 'a/b', 'https://evil.test', '%2e', 'a?b', 'a#b', 'a b']) {
  test(`rejects unsafe repository input ${JSON.stringify(value)} before fetching`, async () => {
    let fetched = false;
    const c = fixture(() => { fetched = true; return json(metadata); });
    await assert.rejects(c.getRepoDetails({ ...args, repo: value }), /repo/i);
    assert.equal(fetched, false);
  });
}
for (const days of [0, -1, 366, 1.5, '30', null]) {
  test(`rejects invalid days ${JSON.stringify(days)}`, async () => {
    await assert.rejects(fixture(() => json(metadata)).getRecentCommits({ ...args, days }), /days/i);
  });
}
for (const hasNext of [false, true]) {
  test(`pagination cap is ${hasNext ? 'partial' : 'complete'} according to next link`, async () => {
    const c = fixture(url => {
      if (!url.pathname.endsWith('/commits')) return json(metadata);
      const page = Number(url.searchParams.get('page'));
      const headers = page < 10 || hasNext
        ? { link: `<https://api.github.com/repos/octocat/Hello-World/commits?page=${page + 1}>; rel="next"` } : {};
      return json(Array.from({ length: 100 }, (_, i) => commit(page * 100 + i)), 200, headers);
    });
    const r = await c.getRecentCommits(args);
    assert.equal(r.commits_observed, 1000);
    assert.equal(r.complete, !hasNext);
    assert.equal(r.measurement, hasNext ? 'lower_bound' : 'exact');
  });
}

test('an empty repository is explicit and has zero activity', async () => {
  const r = await fixture(url => url.pathname.endsWith('/commits')
    ? json({ message: 'Git Repository is empty.' }, 409) : json(metadata)).getRecentCommits(args);
  assert.equal(r.empty_repository, true);
  assert.equal(r.commits_observed, 0);
  assert.equal(r.complete, true);
});
test('an unrelated conflict is not silently counted as an empty repository', async () => {
  await assert.rejects(fixture(url => url.pathname.endsWith('/commits')
    ? json({ message: 'Other conflict' }, 409) : json(metadata)).getRecentCommits(args), /409/);
});
test('404 remains an error rather than zero activity', async () => {
  await assert.rejects(fixture(() => json({ message: 'Not Found' }, 404)).getRecentCommits(args), /404/);
});
test('quota errors carry retry/reset information', async () => {
  await assert.rejects(fixture(() => json({ message: 'API rate limit exceeded' }, 403,
    { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': '1792500000', 'retry-after': '60' })).getRepoDetails(args),
  e => e.code === 'RATE_LIMIT' && e.retry_after === '60' && e.reset_at === '1792500000');
});
test('network timeout is reported distinctly', async () => {
  await assert.rejects(fixture(() => { throw new DOMException('Timeout', 'TimeoutError'); }).getRepoDetails(args),
    e => e.code === 'TIMEOUT');
});
test('malformed success responses do not manufacture metrics', async () => {
  await assert.rejects(fixture(() => json({})).getRepoDetails(args), e => e.code === 'BAD_RESPONSE');
});
test('untrusted pagination link cannot cause a request to an outside host', async () => {
  const c = fixture(url => !url.pathname.endsWith('/commits') ? json(metadata)
    : json([commit(1)], 200, { link: '<https://evil.test/leak?page=2>; rel="next"' }));
  await assert.rejects(c.getRecentCommits(args), e => e.code === 'BAD_RESPONSE');
});

test('GitHub repository-ID pagination links continue through the validated named endpoint', async () => {
  let pages = 0;
  const c = fixture(url => {
    if (!url.pathname.endsWith('/commits')) return json(metadata);
    assert.equal(url.pathname, '/repos/octocat/Hello-World/commits');
    pages++;
    return pages === 1 ? json([commit(1)], 200,
      { link: '<https://api.github.com/repositories/1296269/commits?per_page=100&page=2>; rel="next"' }) : json([commit(2)]);
  });
  const result = await c.getRecentCommits(args);
  assert.equal(result.commits_observed, 2);
  assert.equal(result.complete, true);
});
test('a body-read timeout retains its timeout diagnosis', async () => {
  const c = fixture(() => ({ ok: true, status: 200, headers: new Headers(),
    json: async () => { throw new DOMException('Timeout', 'TimeoutError'); } }));
  await assert.rejects(c.getRepoDetails(args), e => e.code === 'TIMEOUT');
});
test('non-JSON quota response retains retry information', async () => {
  const c = fixture(() => new Response('<html>Too many requests</html>', { status: 429,
    headers: { 'retry-after': '90' } }));
  await assert.rejects(c.getRepoDetails(args), e => e.code === 'RATE_LIMIT' && e.retry_after === '90');
});

test('renamed repositories follow GitHub API redirects and report the canonical project', async () => {
  const c = fixture((url, options) => {
    assert.equal(options.redirect, 'manual');
    if (url.pathname === '/repos/facebook/react') return new Response(null, { status: 301,
      headers: { location: 'https://api.github.com/repositories/10270250' } });
    if (url.pathname === '/repositories/10270250') return json({ ...metadata, full_name: 'react/react' });
    assert.equal(url.pathname, '/repos/react/react/commits');
    return json([commit(1)]);
  });
  const r = await c.getRepoDetails({ owner: 'facebook', repo: 'react' });
  assert.equal(r.repository_url, 'https://github.com/react/react');
  const commits = await c.getRecentCommits({ owner: 'facebook', repo: 'react' });
  assert.equal(commits.repository_url, 'https://github.com/react/react');
  assert.equal(commits.commits_observed, 1);
});
test('a redirect to another host is rejected before it is fetched', async () => {
  let calls = 0;
  const c = fixture(() => {
    calls++;
    return new Response(null, { status: 301, headers: { location: 'https://evil.test/steal' } });
  });
  await assert.rejects(c.getRepoDetails(args), e => e.code === 'GITHUB_ERROR');
  assert.equal(calls, 1);
});
test('a redirect loop terminates after a bounded number of GitHub requests', async () => {
  let calls = 0;
  const c = fixture(() => {
    calls++;
    return new Response(null, { status: 301, headers: { location: 'https://api.github.com/repositories/123' } });
  });
  await assert.rejects(c.getRepoDetails(args), e => e.code === 'GITHUB_ERROR');
  assert.equal(calls, 6);
});
