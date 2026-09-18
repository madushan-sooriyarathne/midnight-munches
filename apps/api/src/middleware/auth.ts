import { type AuthSession, requireRole } from '@midnightmunches/auth';
import type { UserRole } from '@midnightmunches/auth/permissions';
import { createMiddleware } from 'hono/factory';

/** Rejects with 401/403 unless the Better Auth session cookie belongs to one of `roles`. */
export const requireSession = (roles: readonly UserRole[] = ['user', 'moderator', 'admin']) =>
  createMiddleware<{ Variables: { session: AuthSession } }>(async (c, next) => {
    const guard = await requireRole(c.req.raw.headers, roles);
    if (!guard.ok) return guard.response;

    c.set('session', guard.session);
    await next();
  });
