import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createTelemetryServer } from './tools.js';

const server = createTelemetryServer();
await server.connect(new StdioServerTransport());
