import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

import { env as serverEnv } from './server';

export const env = createEnv({
  extends: [serverEnv],
  server: {
    R2_ACCOUNT_ID: z.string().min(1),
    R2_ACCESS_KEY_ID: z.string().min(1),
    R2_SECRET_ACCESS_KEY: z.string().min(1),
    R2_BUCKET_NAME: z.string().min(1),
    // Full origin of the bucket's public custom domain, e.g. https://media.midnightmunches.lk
    R2_PUBLIC_DOMAIN: z.url(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
