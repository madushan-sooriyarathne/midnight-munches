import { zValidator } from '@hono/zod-validator';
import type { ValidationTargets } from 'hono';
import { z } from 'zod';

import { ApiError } from './errors';

/** `zValidator` that routes failures through `app.onError` instead of its own 400 body. */
export const validator = <T extends z.ZodType, Target extends keyof ValidationTargets>(
  target: Target,
  schema: T,
) =>
  zValidator(target, schema, (result) => {
    if (!result.success) {
      throw new ApiError(400, 'VALIDATION_FAILED', z.prettifyError(result.error));
    }
  });
