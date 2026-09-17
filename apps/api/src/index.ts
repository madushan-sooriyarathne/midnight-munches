import { healthResponseSchema } from '@midnightmunches/types';
import { Hono } from 'hono';
import { logger } from 'hono/logger';

const app = new Hono();

app.use('*', logger());

app.get('/healthz', (c) => {
  const body = healthResponseSchema.parse({
    status: 'ok',
    service: 'midnightmunches-api',
    uptimeSeconds: Math.floor(process.uptime()),
  });

  return c.json(body);
});

app.notFound((c) => c.json({ error: 'not_found' }, 404));

const port = Number(Bun.env.PORT ?? 4000);

export default {
  port,
  fetch: app.fetch,
};

export { app };
