import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const readJson = (path) => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));

test('discovery config lists each provider once and keeps the offline catalogue last', () => {
  const config = readJson('discovery/providers.json');
  const configuredProviders = Object.keys(config.providers);

  assert.deepEqual(new Set(config.fallback_order), new Set(configuredProviders));
  assert.equal(new Set(config.fallback_order).size, config.fallback_order.length);
  assert.equal(config.fallback_order.at(-1), 'local_catalogue');
  for (const id of config.fallback_order) {
    assert.equal(typeof config.providers[id].enabled, 'boolean');
    if (id !== 'local_catalogue') {
      assert.ok(config.providers[id].mcp_server);
      assert.ok(config.providers[id].search_tool);
      assert.ok(config.providers[id].fetch_tool);
    }
  }
  assert.equal(config.providers.exa.search_tool, 'web_search_exa');
  assert.equal(config.providers.exa.fetch_tool, 'web_fetch_exa');
  assert.equal(config.providers.tavily.search_tool, 'tavily-search');
  assert.equal(config.providers.tavily.fetch_tool, 'tavily-extract');
  assert.equal(config.providers.local_catalogue.mode, 'offline');
  assert.equal(config.providers.local_catalogue.file, 'discovery/technology-catalogue.json');
});

test('portable MCP config registers every enabled live provider and its configured tools', () => {
  const config = readJson('.mcp.json');
  const providerConfig = readJson('discovery/providers.json');

  for (const id of providerConfig.fallback_order) {
    const provider = providerConfig.providers[id];
    if (!provider.enabled || id === 'local_catalogue') continue;

    const server = config.mcpServers[provider.mcp_server];
    assert.ok(server?.url, `${id} must have an MCP server URL`);
    if (Array.isArray(server.tools)) {
      assert.ok(server.tools.includes('*') || server.tools.includes(provider.search_tool));
      assert.ok(server.tools.includes('*') || server.tools.includes(provider.fetch_tool));
    }
  }
});

test('offline catalogue exists and each entry has a documentation link and canonical repository', () => {
  const path = new URL('../discovery/technology-catalogue.json', import.meta.url);
  assert.equal(existsSync(path), true);

  const catalogue = JSON.parse(readFileSync(path, 'utf8'));
  assert.ok(catalogue.technologies.length > 0);
  for (const technology of catalogue.technologies) {
    assert.match(technology.documentation, /^https:\/\//);
    assert.ok(technology.repository.owner);
    assert.ok(technology.repository.repo);
  }
});
