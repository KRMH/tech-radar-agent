import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const entry = process.argv[2] ? resolve(process.argv[2]) : resolve(root, 'src/stdio.js');
const client = new Client({ name: 'stdio-verification', version: '1.0.0' });
const transport = new StdioClientTransport({ command: process.execPath, args: [entry], cwd: dirname(entry), stderr: 'inherit' });
try {
  await client.connect(transport);
  const { tools } = await client.listTools();
  assert.deepEqual(tools.map(t => t.name).sort(), ['get_recent_commits', 'get_repo_details']);
  console.log(JSON.stringify({ transport: 'stdio', entry, tools: tools.map(t => t.name), status: 'ok' }));
  const invalid = await client.callTool({ name: 'get_recent_commits', arguments: { owner: 'octocat', repo: 'Hello-World', days: 0 } });
  assert.equal(invalid.isError, true);
  if (process.argv.includes('--live')) {
    const result = await client.callTool({ name: 'get_repo_details', arguments: { owner: 'octocat', repo: 'Hello-World' } });
    assert.notEqual(result.isError, true, result.content?.[0]?.text);
    console.log(JSON.stringify({ transport: 'stdio', result: result.structuredContent }));
  }
} finally {
  await client.close();
  await transport.close();
}
