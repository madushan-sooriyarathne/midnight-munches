import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

import './load';

// Split from `server.ts` so drizzle-kit and migrations only need database vars.
export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    DATABASE_POOL_MAX: z.coerce.number().int().positive().default(10),
    DATABASE_SSL: z.stringbool().default(false),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
