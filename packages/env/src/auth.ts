import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

import { env as serverEnv } from './server';

// NOTE: split from `server.ts` so services that don't mount auth (e.g. api today) boot without
// auth secrets.
export const env = createEnv({
  extends: [serverEnv],
  server: {
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    TRUSTED_ORIGINS: z
      .string()
      .transform((value) =>
        value
          .split(',')
          .map((origin) => origin.trim())
          .filter(Boolean),
      )
      .pipe(z.array(z.url())),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
