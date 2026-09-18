import { auth } from '@midnightmunches/auth';
import { client } from '@midnightmunches/db';
import { env } from '@midnightmunches/env/auth';
import { healthResponseSchema } from '@midnightmunches/types';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { requestId } from 'hono/request-id';

import { ApiError, handleError } from './lib/errors';
import { restaurantRoutes } from './routes/restaurants';
import { uploadRoutes } from './routes/upload';

const app = new Hono();

app.use('*', requestId());
app.use('*', logger());
// Exact origin list shared with Better Auth. Must run before the auth mount so credentialed
// preflights to /api/auth/* get answered.
app.use('/api/*', cors({ origin: env.TRUSTED_ORIGINS, credentials: true }));

app.on(['GET', 'POST'], '/api/auth/*', (c) => auth.handler(c.req.raw));

app.get('/healthz', async (c) => {
  try {
    await client`select 1`;
  } catch (cause) {
    throw new ApiError(503, 'DB_UNAVAILABLE', 'Database unreachable', { cause });
  }

  const body = healthResponseSchema.parse({
    status: 'ok',
    service: 'midnightmunches-api',
    uptimeSeconds: Math.floor(process.uptime()),
  });

  return c.json(body);
});

const routes = app.route('/api/restaurants', restaurantRoutes).route('/api/upload', uploadRoutes);

app.onError(handleError);
app.notFound((c) => c.json({ error: { code: 'NOT_FOUND', message: 'Route not found' } }, 404));

export default {
  port: env.PORT,
  fetch: app.fetch,
};

export { app };
export type AppType = typeof routes;
