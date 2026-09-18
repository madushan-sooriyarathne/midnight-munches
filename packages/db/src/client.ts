import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

/**
 * Raw postgres.js connection. Exported for migrations, health checks and the
 * rare raw query; prefer `db` for everything else.
 *
 * ponytail: env-driven pool size and SSL toggle only. Swap in explicit
 * cert/CA options here if a managed provider ever demands them.
 */
export const client = postgres(connectionString, {
  max: Number(process.env.DATABASE_POOL_MAX ?? 10),
  ssl: process.env.DATABASE_SSL === 'true' ? 'require' : undefined,
});

export const db = drizzle(client, { schema });

export type Database = typeof db;
