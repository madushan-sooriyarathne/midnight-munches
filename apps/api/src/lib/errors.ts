import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

export class ApiError extends HTTPException {
  constructor(
    status: ContentfulStatusCode,
    readonly code: string,
    message: string,
    options?: { cause?: unknown },
  ) {
    super(status, { message, cause: options?.cause });
  }
}

/** `app.onError` handler: one `{ error: { code, message } }` shape, no internals leaked. */
export function handleError(err: Error, c: Context) {
  const status = err instanceof HTTPException ? err.status : 500;

  if (status >= 500) {
    console.error(`[api] ${c.req.method} ${c.req.path} failed`, {
      requestId: c.get('requestId'),
      err,
    });
  }

  if (err instanceof ApiError) {
    return c.json({ error: { code: err.code, message: err.message } }, status);
  }

  // Hono's own throws (e.g. malformed JSON body) carry a safe message.
  if (err instanceof HTTPException) {
    return c.json({ error: { code: 'HTTP_ERROR', message: err.message } }, status);
  }

  return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Unexpected error' } }, 500);
}
