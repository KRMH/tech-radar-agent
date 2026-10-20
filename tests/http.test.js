import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { createTelemetryHttpServer } from '../hosted/http.js';
import { createGitHubClient } from '../src/github-client.js';

async function fixture(t) {
  const client = createGitHubClient({ fetchImpl: async url => {
    const owner = new URL(url).pathname.split('/')[2];
    await new Promise(resolve => setTimeout(resolve, owner === 'first' ? 20 : 1));
    return new Response(JSON.stringify({ private: false, default_branch: 'main', archived: false,
      stargazers_count: owner === 'first' ? 1 : 2, forks_count: 0, open_issues_count: 0, pushed_at: null }));
  } });
  const server = createTelemetryHttpServer({ client });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())));
  return `http://127.0.0.1:${server.address().port}`;
}
async function connect(t, url) {
  const client = new Client({ name: 'http-test', version: '1.0.0' });
  t.after(() => client.close());
  await client.connect(new StreamableHTTPClientTransport(new URL(`${url}/mcp`)));
  return client;
}
test('HTTP MCP initializes, lists tools and returns independent concurrent calls', async t => {
  const url = await fixture(t);
  const a = await connect(t, url), b = await connect(t, url);
  assert.equal((await a.listTools()).tools.length, 2);
  const [one, two] = await Promise.all([
    a.callTool({ name: 'get_repo_details', arguments: { owner: 'first', repo: 'repo' } }),
    b.callTool({ name: 'get_repo_details', arguments: { owner: 'second', repo: 'repo' } })
  ]);
  assert.equal(one.structuredContent.stargazers_count, 1);
  assert.equal(two.structuredContent.stargazers_count, 2);
  const invalid = await a.callTool({ name: 'get_recent_commits', arguments: { owner: 'first', repo: 'repo', days: 0 } });
  assert.equal(invalid.isError, true);
});
test('HTTP guards disallowed origins, malformed and oversized requests', async t => {
  const url = await fixture(t);
  assert.equal((await fetch(`${url}/health`)).status, 200);
  assert.match(await (await fetch(url)).text(), /GitHub Telemetry/);
  assert.equal((await fetch(`${url}/mcp`, { method: 'POST', headers: { Origin: 'https://evil.test' } })).status, 403);
  assert.equal((await fetch(`${url}/mcp`, { method: 'POST', body: '{}' })).status, 415);
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' };
  assert.equal((await fetch(`${url}/mcp`, { method: 'POST', headers, body: 'invalid' })).status, 400);
  assert.equal((await fetch(`${url}/mcp`, { method: 'POST', headers, body: 'x'.repeat(65537) })).status, 413);
  assert.equal((await fetch(`${url}/mcp`)).status, 405);
});
