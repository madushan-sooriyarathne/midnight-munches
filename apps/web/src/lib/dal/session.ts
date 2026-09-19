import 'server-only';

import { env } from '@midnightmunches/env/client';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Better Auth answers `null` when the cookie carries no live session.
const sessionSchema = z.object({ user: z.object({ id: z.string() }) }).nullable();

/**
 * Asks the API whether the request's Better Auth cookie is signed in. The cookie reaches this app
 * because cookies ignore ports (dev) and are scoped to `.midnightmunches.lk` (prod).
 */
export async function getIsSignedIn() {
  // Outside the try: `cookies()` throws Next's signal that opts the route out of prerendering.
  const cookie = (await cookies()).toString();

  try {
    if (!env.NEXT_PUBLIC_API_URL) throw new Error('NEXT_PUBLIC_API_URL is not set');

    const res = await fetch(new URL('/api/auth/get-session', env.NEXT_PUBLIC_API_URL), {
      headers: { cookie },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`GET /api/auth/get-session responded ${res.status}`);

    return sessionSchema.parse(await res.json()) !== null;
  } catch (cause) {
    console.error('Failed to check the session for /submit', cause);
    return false;
  }
}
