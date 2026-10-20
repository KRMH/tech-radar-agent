import { createServer } from 'node:http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createTelemetryServer } from '../src/tools.js';

const landing = `<!doctype html><html lang="fr"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>GitHub Telemetry</title><style>body{font:18px system-ui;max-width:760px;margin:8vh auto;padding:24px;line-height:1.6}code{background:#eee;padding:3px 6px}</style>
<h1>GitHub Telemetry</h1><p>Statistiques des dépôts GitHub publics et activité des commits pour Tech Radar.</p>
<p>Deux outils en lecture seule : <code>get_repo_details</code> et <code>get_recent_commits</code>.</p>
<p>Connexion MCP HTTP : <code>/mcp</code>. État du service : <a href="/health">/health</a>.</p>
<p>Aucun jeton GitHub requis. Les quotas de l’API publique s’appliquent. Les résultats partiels sont signalés.</p>
<p>Cette page confirme uniquement que ce serveur répond ; elle ne prouve pas sa publication ou son installation comme plugin.</p></html>`;

export function createTelemetryHttpServer({ client, allowedHosts = ['127.0.0.1', 'localhost', '[::1]'], allowedOrigins = [] } = {}) {
  return createServer(async (req, res) => {
    function send(status, value) {
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'X-Content-Type-Options': 'nosniff' });
      res.end(JSON.stringify(value));
    }
    let host;
    try { host = new URL(`http://${req.headers.host}`).hostname; } catch { return send(400, { error: 'Invalid Host' }); }
    if (!allowedHosts.includes(host)) return send(403, { error: 'Host not allowed' });
    if (req.headers.origin && !allowedOrigins.includes(req.headers.origin)) return send(403, { error: 'Origin not allowed' });
    const path = (req.url ?? '').split('?')[0];
    if (path === '/health' && req.method === 'GET') return send(200, { status: 'ok', name: 'github-telemetry', version: '0.1.0' });
    if (path === '/' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8',
        'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",
        'X-Content-Type-Options': 'nosniff' });
      return res.end(landing);
    }
    if (path !== '/mcp') return send(404, { error: 'Not found' });
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return send(405, { error: 'Method not allowed' }); }
    if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] ?? '')) return send(415, { error: 'JSON required' });
    let body;
    try {
      const chunks = [];
      let size = 0;
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 65_536) { send(413, { error: 'Request too large' }); return; }
        chunks.push(chunk);
      }
      body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch { return send(400, { error: 'Invalid JSON' }); }
    const server = createTelemetryServer({ client });
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    res.on('close', () => { void transport.close(); void server.close(); });
    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, body);
    } catch {
      if (!res.headersSent) send(500, { error: 'MCP request failed' });
    }
  });
}
