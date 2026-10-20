import assert from 'node:assert/strict';
import { once } from 'node:events';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { createTelemetryServer } from '../src/tools.js';
import { createTelemetryHttpServer } from '../hosted/http.js';

const localServer = createTelemetryServer();
const [a, b] = InMemoryTransport.createLinkedPair();
const local = new Client({ name: 'live-verification', version: '1.0.0' });
const httpServer = createTelemetryHttpServer();
const remote = new Client({ name: 'live-http-verification', version: '1.0.0' });
try {
  await localServer.connect(a);
  await local.connect(b);
  httpServer.listen(0, '127.0.0.1');
  await once(httpServer, 'listening');
  await remote.connect(new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${httpServer.address().port}/mcp`)));
  for (const [mode, client] of [['shared_mcp', local], ['http_loopback', remote]]) {
    assert.equal((await client.listTools()).tools.length, 2);
    for (const name of ['get_repo_details', 'get_recent_commits']) {
      const result = await client.callTool({ name, arguments: { owner: 'octocat', repo: 'Hello-World' } });
      assert.notEqual(result.isError, true, result.content?.[0]?.text);
      assert.equal(result.structuredContent.repository_url, 'https://github.com/octocat/Hello-World');
      console.log(JSON.stringify({ mode, tool: name, result: result.structuredContent }));
    }
  }
} finally {
  await local.close();
  await localServer.close();
  await remote.close();
  await new Promise(resolve => httpServer.close(resolve));
}
