import { describe, expect, test } from 'bun:test';
import type { StallStatusResult } from '@midnightmunches/types/time';

import type { Stall } from './dal/stalls';
import { getDistanceKm, matchesFilters, parseFilters, rankStalls } from './stalls';

const FORT = { latitude: 6.9344, longitude: 79.8428 };
const KANDY = { latitude: 7.2906, longitude: 80.6337 };
const OPEN: StallStatusResult = { status: 'OPEN_NOW', closesInMinutes: 60, label: '' };
const CLOSED: StallStatusResult = { status: 'CLOSED', isEmergency: false, label: '' };

function makeStall(overrides: Partial<Stall> = {}): Stall {
  return {
    id: crypto.randomUUID(),
    name: 'Test Stall',
    slug: 'test-stall',
    address: '1 Galle Road',
    district: 'Colombo 03',
    ...FORT,
    phone: null,
    deliveryUrls: null,
    foodTypes: ['Kottu'],
    isEmergencyClosed: false,
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    operatingHours: [],
    media: [],
    ...overrides,
  };
}

describe('getDistanceKm', () => {
  test('Colombo Fort to Kandy is ~96 km as the crow flies', () => {
    expect(getDistanceKm(FORT, KANDY)).toBeCloseTo(95.8, 0);
  });

  test('same point is 0', () => {
    expect(getDistanceKm(FORT, FORT)).toBe(0);
  });
});

describe('rankStalls', () => {
  const kandy = makeStall({ name: 'Kandy', ...KANDY });
  const fort = makeStall({ name: 'Fort', ...FORT });

  test('keeps API order without coords', () => {
    const ranked = rankStalls([kandy, fort], null);
    expect(ranked.map((entry) => entry.stall.name)).toEqual(['Kandy', 'Fort']);
    expect(ranked.every((entry) => entry.distanceKm === null)).toBe(true);
  });

  test('sorts nearest first with coords', () => {
    const ranked = rankStalls([kandy, fort], FORT);
    expect(ranked.map((entry) => entry.stall.name)).toEqual(['Fort', 'Kandy']);
    expect(ranked[0]?.distanceKm).toBe(0);
  });
});

describe('matchesFilters', () => {
  const streetFood = makeStall({
    district: 'Colombo 07',
    foodTypes: ['Burgers', 'Street Food'],
    deliveryUrls: { pickme: 'https://pickme.lk/food/x' },
  });

  test('matches free-text food types and districts by slug', () => {
    const entry = { stall: streetFood, status: CLOSED, distanceKm: null };
    expect(matchesFilters(entry, { category: 'street-food', area: 'colombo-07' })).toBe(true);
    expect(matchesFilters(entry, { category: 'kottu' })).toBe(false);
    expect(matchesFilters(entry, { area: 'colombo-03' })).toBe(false);
  });

  test('platform needs a delivery link, open needs OPEN_NOW', () => {
    expect(
      matchesFilters(
        { stall: streetFood, status: OPEN, distanceKm: null },
        { platform: 'pickme', open: '1' },
      ),
    ).toBe(true);
    expect(
      matchesFilters(
        { stall: streetFood, status: OPEN, distanceKm: null },
        { platform: 'ubereats' },
      ),
    ).toBe(false);
    expect(
      matchesFilters({ stall: streetFood, status: CLOSED, distanceKm: null }, { open: '1' }),
    ).toBe(false);
  });
});

test('parseFilters drops values outside the known sets', () => {
  const params = new URLSearchParams('category=pizza&area=colombo-03&platform=grab&open=yes');
  expect(parseFilters(params)).toEqual({ area: 'colombo-03' });
  expect(parseFilters(new URLSearchParams('category=kottu&open=1'))).toEqual({
    category: 'kottu',
    open: '1',
  });
});
