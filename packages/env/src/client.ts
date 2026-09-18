import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

// NOTE: no `./load` import: it uses node:fs and this module ships to the browser. Next apps load
// the root .env in next.config.ts instead.
export const env = createEnv({
  client: {
    NEXT_PUBLIC_API_URL: z.url().optional(),
  },
  // Next only inlines `process.env.NEXT_PUBLIC_*` when each one is referenced literally.
  runtimeEnv: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  emptyStringAsUndefined: true,
});
