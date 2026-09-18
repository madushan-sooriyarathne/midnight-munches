import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

import './load';

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
