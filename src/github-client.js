const API = 'https://api.github.com';
const DAY = 86_400_000;

export class TelemetryError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'TelemetryError';
    this.code = code;
    Object.assign(this, details);
  }
}
function badResponse() {
  return new TelemetryError('BAD_RESPONSE', 'Réponse GitHub inattendue ; aucune mesure fiable disponible.');
}
function validate({ owner, repo }) {
  if (typeof owner !== 'string' || !/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(owner)) {
    throw new TelemetryError('INVALID_INPUT', 'owner doit être un compte GitHub valide.');
  }
  if (typeof repo !== 'string' || !/^[A-Za-z0-9_.-]{1,100}$/.test(repo) || ['.', '..'].includes(repo)) {
    throw new TelemetryError('INVALID_INPUT', 'repo doit être un nom de dépôt GitHub valide.');
  }
  return `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
}
function nextPage(link, path, page) {
  if (!link) return false;
  const entry = link.split(',').find(part => /;\s*rel="next"/.test(part));
  if (!entry) return false;
  const match = entry.match(/<([^>]+)>/);
  if (!match) throw badResponse();
  let url;
  try { url = new URL(match[1]); } catch { throw badResponse(); }
  const validPath = url.pathname === path || /^\/repositories\/\d+\/commits$/.test(url.pathname);
  if (url.origin !== API || !validPath || url.username || url.password ||
      url.searchParams.get('page') !== String(page + 1)) throw badResponse();
  return true;
}

export function createGitHubClient({ fetchImpl = globalThis.fetch, now = () => new Date() } = {}) {
  async function request(url, { emptyAllowed = false } = {}) {
    let res;
    const signal = AbortSignal.timeout(15_000);
    for (let redirects = 0; ; redirects++) {
      try {
        res = await fetchImpl(url, {
          headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2026-03-10',
            'User-Agent': 'GitHub-Telemetry/0.1.0' },
          signal, redirect: 'manual'
        });
      } catch (error) {
        const timeout = ['TimeoutError', 'AbortError'].includes(error.name);
        throw new TelemetryError(timeout ? 'TIMEOUT' : 'NETWORK', timeout
          ? 'GitHub ne répond pas dans le délai de 15 secondes.'
          : 'Connexion à l’API GitHub indisponible. Réessayer ou vérifier le réseau.');
      }
      if (![301, 302, 303, 307, 308].includes(res.status)) break;
      let target;
      try { target = new URL(res.headers.get('location') ?? '', url); } catch { target = null; }
      const allowedPath = target && /^\/(?:repositories\/\d+|repos\/[A-Za-z0-9-]+\/[A-Za-z0-9_.-]+)(?:\/commits)?$/.test(target.pathname);
      const allowed = target && target.origin === API && !target.username && !target.password &&
        !target.hash && res.headers.get('location') && allowedPath;
      await res.body?.cancel();
      if (!allowed || redirects >= 5) {
        throw new TelemetryError('GITHUB_ERROR', 'Redirection GitHub refusée ou trop de redirections.', { status: res.status });
      }
      url = target.href;
    }
    let body;
    try { body = await res.json(); } catch (error) {
      if (res.ok && ['TimeoutError', 'AbortError'].includes(error.name)) {
        throw new TelemetryError('TIMEOUT', 'GitHub ne répond pas dans le délai de 15 secondes.');
      }
      if (res.ok) throw badResponse();
      body = null;
    }
    if (emptyAllowed && res.status === 409 && body?.message === 'Git Repository is empty.') {
      return { body: [], headers: res.headers, empty: true };
    }
    if (!res.ok) {
      const quota = res.status === 429 || (res.status === 403 &&
        (res.headers.get('x-ratelimit-remaining') === '0' || /rate limit/i.test(body?.message ?? '')));
      throw new TelemetryError(quota ? 'RATE_LIMIT' : 'GITHUB_ERROR', quota
        ? 'Limite GitHub atteinte. Réessayer après le délai indiqué.'
        : `GitHub HTTP ${res.status} : dépôt inaccessible ou requête refusée.`, {
        status: res.status, retry_after: res.headers.get('retry-after'),
        reset_at: res.headers.get('x-ratelimit-reset')
      });
    }
    return { body, headers: res.headers, empty: false };
  }
  async function metadata(path, at) {
    const { body: r } = await request(`${API}${path}`);
    if (!r || r.private !== false || typeof r.default_branch !== 'string' ||
        typeof r.archived !== 'boolean' ||
        !['stargazers_count', 'forks_count', 'open_issues_count'].every(k => Number.isInteger(r[k]) && r[k] >= 0)) {
      throw badResponse();
    }
    let canonicalPath = path;
    if (r.full_name !== undefined) {
      const parts = typeof r.full_name === 'string' ? r.full_name.split('/') : [];
      if (parts.length !== 2) throw badResponse();
      try { canonicalPath = validate({ owner: parts[0], repo: parts[1] }); } catch { throw badResponse(); }
    }
    return {
      repository_url: `https://github.com${canonicalPath.slice(6)}`, collected_at: at,
      stargazers_count: r.stargazers_count, forks_count: r.forks_count,
      open_issues_and_pull_requests_count: r.open_issues_count,
      archived: r.archived, pushed_at: r.pushed_at ?? null, default_branch: r.default_branch
    };
  }
  return {
    async getRepoDetails(args) {
      return metadata(validate(args), now().toISOString());
    },
    async getRecentCommits({ owner, repo, days = 30 }) {
      const path = validate({ owner, repo });
      if (!Number.isInteger(days) || days < 1 || days > 365) {
        throw new TelemetryError('INVALID_INPUT', 'days doit être un entier entre 1 et 365.');
      }
      const end = now();
      const until = end.toISOString();
      const since = new Date(end.getTime() - days * DAY).toISOString();
      const info = await metadata(path, until);
      const commitPath = `/repos${new URL(info.repository_url).pathname}/commits`;
      let count = 0, complete = false, empty = false;
      const recent = [];
      for (let page = 1; page <= 10; page++) {
        const url = new URL(`${API}${commitPath}`);
        url.search = new URLSearchParams({ sha: info.default_branch, since, until,
          per_page: '100', page: String(page) }).toString();
        const response = await request(url.href, { emptyAllowed: true });
        if (!Array.isArray(response.body)) throw badResponse();
        empty = response.empty;
        for (const item of response.body) {
          if (typeof item?.sha !== 'string' || typeof item?.commit?.message !== 'string' ||
              !Number.isFinite(Date.parse(item?.commit?.committer?.date))) throw badResponse();
          count++;
          if (recent.length < 10) recent.push({ sha: item.sha,
            message: item.commit.message.slice(0, 2000), date: item.commit.committer.date,
            url: `${info.repository_url}/commit/${encodeURIComponent(item.sha)}` });
        }
        if (!nextPage(response.headers.get('link'), commitPath, page)) {
          complete = true;
          break;
        }
      }
      return { repository_url: info.repository_url, collected_at: until,
        branch: info.default_branch, since, until, days, commits_observed: count,
        commits_per_day: Number((count / days).toFixed(4)), complete,
        measurement: complete ? 'exact' : 'lower_bound',
        includes_merge_commits: true, empty_repository: empty, recent_commits: recent,
        note: complete ? 'Commits de fusion inclus. Mesure de l’activité, pas de la qualité.'
          : 'Collecte partielle : le nombre et la moyenne sont des bornes inférieures. Commits de fusion inclus.' };
    }
  };
}
