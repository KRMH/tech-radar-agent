import { createTelemetryHttpServer } from './http.js';

const host = process.env.HOST ?? '127.0.0.1';
const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT invalide');
const publicOrigin = process.env.PUBLIC_ORIGIN ? new URL(process.env.PUBLIC_ORIGIN) : undefined;
if (publicOrigin && publicOrigin.protocol !== 'https:') throw new Error('PUBLIC_ORIGIN doit utiliser HTTPS');
const server = createTelemetryHttpServer({
  allowedHosts: ['127.0.0.1', 'localhost', '[::1]', ...(publicOrigin ? [publicOrigin.hostname] : [])],
  allowedOrigins: publicOrigin ? [publicOrigin.origin] : []
});
server.listen(port, host, () => console.error(`GitHub Telemetry HTTP écoute sur ${host}:${port}.`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close());
