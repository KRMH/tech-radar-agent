import test from 'node:test';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createTelemetryServer } from '../src/tools.js';
import { createGitHubClient } from '../src/github-client.js';

async function connect(t, fetchImpl) {
  const [a, b] = InMemoryTransport.createLinkedPair();
  const server = createTelemetryServer({ client: createGitHubClient({ fetchImpl }) });
  const client = new Client({ name: 'telemetry-test', version: '1.0.0' });
  t.after(async () => { await client.close(); await server.close(); });
  await server.connect(a);
  await client.connect(b);
  return client;
}
test('MCP discovers two read-only tools and validates required inputs', async t => {
  const client = await connect(t, async () => { throw new Error('must not fetch'); });
  const { tools } = await client.listTools();
  assert.deepEqual(tools.map(x => x.name).sort(), ['get_recent_commits', 'get_repo_details']);
  assert.deepEqual(tools[0].inputSchema.required, ['owner', 'repo']);
  assert.equal(tools.every(x => x.annotations.readOnlyHint), true);
  const r = await client.callTool({ name: 'get_repo_details', arguments: { owner: 'octocat' } });
  assert.equal(r.isError, true);
});
test('MCP call returns mapped metrics from the real GitHub collector', async t => {
  const client = await connect(t, async () => new Response(JSON.stringify({
    private: false, default_branch: 'main', stargazers_count: 8, forks_count: 2,
    open_issues_count: 3, archived: true, pushed_at: null
  })));
  const r = await client.callTool({ name: 'get_repo_details', arguments: { owner: 'octocat', repo: 'Hello-World' } });
  assert.equal(r.isError, undefined);
  assert.equal(r.structuredContent.stargazers_count, 8);
  assert.equal(r.structuredContent.archived, true);
  assert.equal(JSON.parse(r.content[0].text).open_issues_and_pull_requests_count, 3);
});
test('MCP errors expose a usable code and never a false success result', async t => {
  const client = await connect(t, async () => new Response('{"message":"Not Found"}', { status: 404 }));
  const r = await client.callTool({ name: 'get_repo_details', arguments: { owner: 'octocat', repo: 'missing' } });
  assert.equal(r.isError, true);
  assert.equal(JSON.parse(r.content[0].text).error.code, 'GITHUB_ERROR');
});
