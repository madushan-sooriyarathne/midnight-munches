import { env } from '@midnightmunches/env/db';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema/index.ts',
  out: './drizzle',
  dbCredentials: { url: env.DATABASE_URL },
  strict: true,
  verbose: true,
});
