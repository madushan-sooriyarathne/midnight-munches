import 'server-only';

import type { AppType } from '@midnightmunches/api';
import { env } from '@midnightmunches/env/client';
import { hc, type InferResponseType } from 'hono/client';

type Client = ReturnType<typeof hc<AppType>>;

export type Stall = InferResponseType<Client['api']['restaurants']['$get'], 200>['data'][number];

/** Approved stalls for the public directory, or `null` when the API can't be reached. */
// ponytail: one page of 50 (the API's max) since the directory filters client-side; page through
// or raise the cap once the catalog outgrows it.
export async function getStalls() {
  try {
    if (!env.NEXT_PUBLIC_API_URL) throw new Error('NEXT_PUBLIC_API_URL is not set');

    const res = await hc<AppType>(env.NEXT_PUBLIC_API_URL).api.restaurants.$get(
      { query: { limit: '50' } },
      // Status is computed at render time, so a slightly stale list only delays new approvals.
      { init: { next: { revalidate: 300 } } },
    );
    if (!res.ok) throw new Error(`GET /api/restaurants responded ${res.status}`);

    const { data } = await res.json();
    return data;
  } catch (cause) {
    console.error('Failed to load stalls for the directory', cause);
    return null;
  }
}
