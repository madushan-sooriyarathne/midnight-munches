import { env } from '@midnightmunches/env/db';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema';

/**
 * Raw postgres.js connection. Exported for migrations, health checks and the
 * rare raw query; prefer `db` for everything else.
 *
 * ponytail: env-driven pool size and SSL toggle only. Swap in explicit
 * cert/CA options here if a managed provider ever demands them.
 */
export const client = postgres(env.DATABASE_URL, {
  max: env.DATABASE_POOL_MAX,
  ssl: env.DATABASE_SSL ? 'require' : undefined,
});

export const db = drizzle(client, { schema });

export type Database = typeof db;
