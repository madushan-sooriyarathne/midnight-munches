import { account, db, session, user, verification } from '@midnightmunches/db';
import { env } from '@midnightmunches/env/auth';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { APIError } from 'better-auth/api';
import { admin } from 'better-auth/plugins';

import { hasRole, roles, type UserRole } from './permissions';
import type { AuthSession } from './types';

const isProduction = env.NODE_ENV === 'production';

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: env.TRUSTED_ORIGINS,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: { user, session, account, verification },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ url }) => {
      // ponytail: no mail provider yet. Dev prints the link (local-only token);
      // production fails loud rather than silently dropping it. Wire a sender here.
      if (isProduction) {
        throw new APIError('INTERNAL_SERVER_ERROR', {
          code: 'EMAIL_DELIVERY_NOT_CONFIGURED',
          message: 'Email delivery is not configured',
        });
      }
      console.info(`[auth] email verification link: ${url}`);
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [admin({ roles, defaultRole: 'user', adminRoles: ['admin'] })],
  advanced: {
    // Shares the session across web, dashboard and api subdomains (SSO).
    crossSubDomainCookies: { enabled: isProduction, domain: '.midnightmunches.lk' },
    defaultCookieAttributes: { sameSite: 'lax', secure: isProduction, httpOnly: true },
  },
});

type GuardResult = { ok: true; session: AuthSession } | { ok: false; response: Response };

/**
 * Route guard for Next.js route handlers / Node-runtime middleware and Hono
 * (`c.req.raw.headers`). Returns a ready 401/403 `Response` on failure.
 */
export async function requireRole(
  headers: Headers,
  allowedRoles: readonly UserRole[],
): Promise<GuardResult> {
  const result = await auth.api.getSession({ headers });

  if (!result) {
    return {
      ok: false,
      response: Response.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 },
      ),
    };
  }

  const { role } = result.user;

  if (!hasRole(role, allowedRoles)) {
    return {
      ok: false,
      response: Response.json(
        { error: { code: 'FORBIDDEN', message: 'Insufficient role' } },
        { status: 403 },
      ),
    };
  }

  return { ok: true, session: { session: result.session, user: { ...result.user, role } } };
}

export type { AuthSession, SessionUser } from './types';
