import { getStallStatus, type StallStatusResult } from '@midnightmunches/types/time';
import { z } from 'zod/mini';

import type { Stall } from './dal/stalls';

export const CATEGORIES = ['kottu', 'burgers', 'chai', 'street-food'] as const;
export const PLATFORMS = ['ubereats', 'pickme'] as const;

export type Category = (typeof CATEGORIES)[number];
export type Platform = (typeof PLATFORMS)[number];
export type Coords = { latitude: number; longitude: number };
export type RankedStall = { stall: Stall; status: StallStatusResult; distanceKm: number | null };

// Search params are user-editable, so a bad value is dropped instead of breaking the page.
const filtersSchema = z.object({
  category: z.catch(z.optional(z.enum(CATEGORIES)), undefined),
  area: z.catch(z.optional(z.string()), undefined),
  platform: z.catch(z.optional(z.enum(PLATFORMS)), undefined),
  open: z.catch(z.optional(z.literal('1')), undefined),
});

export type Filters = z.infer<typeof filtersSchema>;

export function parseFilters(searchParams: URLSearchParams): Filters {
  return filtersSchema.parse(Object.fromEntries(searchParams));
}

/** Pairs each stall with its live status and, when `coords` is known, sorts nearest first. */
export function rankStalls(stalls: Stall[], coords: Coords | null, now = new Date()) {
  return (
    stalls
      .map(
        (stall): RankedStall => ({
          stall,
          status: getStallStatus(stall, now),
          distanceKm: coords ? getDistanceKm(coords, stall) : null,
        }),
      )
      // Stable sort: without coords every key ties, so the API's order survives.
      .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0))
  );
}

export function matchesFilters({ stall, status }: RankedStall, filters: Filters) {
  return (
    (!filters.category || stall.foodTypes.some((type) => toSlug(type) === filters.category)) &&
    (!filters.area || toSlug(stall.district) === filters.area) &&
    (!filters.platform || Boolean(stall.deliveryUrls?.[filters.platform])) &&
    (!filters.open || status.status === 'OPEN_NOW')
  );
}

/** Great-circle distance via the Haversine formula; no paid geocoding involved. */
export function getDistanceKm(from: Coords, to: Coords) {
  const EARTH_RADIUS_KM = 6371;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const dLat = toRadians(to.latitude - from.latitude);
  const dLng = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

/** "Street Food" -> "street-food", "Colombo 03" -> "colombo-03". */
export function toSlug(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '-');
}
