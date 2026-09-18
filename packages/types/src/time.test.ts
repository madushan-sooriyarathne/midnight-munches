import { expect, test } from 'bun:test';
import type { OperatingWindow } from './time';
import { getStallStatus } from './time';

// Colombo wall-clock instants. Sep 2026: Wed 16, Thu 17, Fri 18, Sat 19, Sun 20.
const at = (local: string) => new Date(`${local}+05:30`);
const slot = (dayOfWeek: number, openTime: string, closeTime: string) => ({
  dayOfWeek,
  openTime,
  closeTime,
});
const schedule = (operatingHours: OperatingWindow[]) => ({
  isEmergencyClosed: false,
  operatingHours,
});

const FRI_NIGHT = [slot(5, '22:00:00', '04:00:00')];
const LUNCH_AND_NIGHT = [slot(3, '11:00', '15:00'), slot(3, '19:00', '02:00')];

test.each<[string, OperatingWindow[], string, Record<string, unknown>]>([
  // Core spans
  [
    'daytime span mid-shift',
    [slot(3, '10:00', '22:00')],
    '2026-09-16T14:00:00',
    { status: 'OPEN_NOW', closesInMinutes: 480, label: 'Closes in 8h' },
  ],
  [
    'overnight span before midnight',
    FRI_NIGHT,
    '2026-09-18T23:30:00',
    { status: 'OPEN_NOW', closesInMinutes: 270, label: 'Closes in 4h 30m' },
  ],
  [
    'overnight span after midnight belongs to the previous day',
    FRI_NIGHT,
    '2026-09-19T02:30:00',
    { status: 'OPEN_NOW', closesInMinutes: 90, label: 'Closes in 1h 30m' },
  ],
  [
    "previous day's overnight slot wins over today's daytime slot",
    [...FRI_NIGHT, slot(6, '10:00', '16:00')],
    '2026-09-19T02:00:00',
    { status: 'OPEN_NOW', closesInMinutes: 120 },
  ],

  // Boundaries: [open, close)
  [
    'exactly at openTime',
    FRI_NIGHT,
    '2026-09-18T22:00:00',
    { status: 'OPEN_NOW', closesInMinutes: 360, label: 'Closes in 6h' },
  ],
  [
    'exactly at closeTime',
    FRI_NIGHT,
    '2026-09-19T04:00:00',
    { status: 'CLOSED', isEmergency: false },
  ],
  [
    'one second before openTime',
    FRI_NIGHT,
    '2026-09-18T21:59:59',
    {
      status: 'OPENS_AT',
      opensInMinutes: 1,
      opensAt: '10:00 PM',
      day: 'today',
      label: 'Opens today at 10:00 PM',
    },
  ],
  [
    'one second before closeTime rounds up, never 0m',
    FRI_NIGHT,
    '2026-09-19T03:59:59',
    { status: 'OPEN_NOW', closesInMinutes: 1, label: 'Closes in 1m' },
  ],
  [
    '23:59 inside an overnight span',
    [slot(5, '23:00', '02:00')],
    '2026-09-18T23:59:00',
    { status: 'OPEN_NOW', closesInMinutes: 121, label: 'Closes in 2h 1m' },
  ],
  [
    '00:01 inside an overnight span',
    [slot(5, '23:00', '02:00')],
    '2026-09-19T00:01:00',
    { status: 'OPEN_NOW', closesInMinutes: 119, label: 'Closes in 1h 59m' },
  ],

  // Week wrap and the 24h horizon
  [
    'Saturday overnight into Sunday morning',
    [slot(6, '22:00', '04:00')],
    '2026-09-20T02:00:00',
    { status: 'OPEN_NOW', closesInMinutes: 120 },
  ],
  [
    'Saturday night before a Sunday midnight opening',
    [slot(0, '00:00', '03:00')],
    '2026-09-19T22:00:00',
    {
      status: 'OPENS_AT',
      opensInMinutes: 120,
      opensAt: '12:00 AM',
      day: 'tomorrow',
      label: 'Opens tomorrow at 12:00 AM',
    },
  ],
  [
    'opening exactly 24h away',
    FRI_NIGHT,
    '2026-09-17T22:00:00',
    { status: 'OPENS_AT', opensInMinutes: 1440, day: 'tomorrow' },
  ],
  [
    'opening 24h and one second away',
    FRI_NIGHT,
    '2026-09-17T21:59:59',
    { status: 'CLOSED', isEmergency: false },
  ],
  [
    'off-day',
    [slot(1, '18:00', '23:00')],
    '2026-09-16T12:00:00',
    { status: 'CLOSED', isEmergency: false, label: 'Closed' },
  ],
  [
    'afternoon opening formats as PM',
    [slot(3, '12:30', '15:00')],
    '2026-09-16T10:00:00',
    { status: 'OPENS_AT', opensAt: '12:30 PM', label: 'Opens today at 12:30 PM' },
  ],

  // Multiple slots in one day
  [
    'inside the lunch slot',
    LUNCH_AND_NIGHT,
    '2026-09-16T12:00:00',
    { status: 'OPEN_NOW', closesInMinutes: 180 },
  ],
  [
    'between lunch and night slots',
    LUNCH_AND_NIGHT,
    '2026-09-16T16:00:00',
    { status: 'OPENS_AT', opensInMinutes: 180, opensAt: '7:00 PM', day: 'today' },
  ],
  [
    'night slot after midnight',
    LUNCH_AND_NIGHT,
    '2026-09-17T01:00:00',
    { status: 'OPEN_NOW', closesInMinutes: 60 },
  ],
  [
    'overlapping slots take the latest close',
    [slot(5, '20:00', '04:00'), slot(6, '00:00', '06:00')],
    '2026-09-19T01:00:00',
    { status: 'OPEN_NOW', closesInMinutes: 300 },
  ],
  [
    'openTime equal to closeTime is a 24h slot',
    [slot(3, '00:00', '00:00')],
    '2026-09-16T12:00:00',
    { status: 'OPEN_NOW', closesInMinutes: 720, label: 'Closes in 12h' },
  ],
])('%s', (_name, operatingHours, now, expected) => {
  expect(getStallStatus(schedule(operatingHours), at(now))).toMatchObject(expected);
});

test('emergency closure overrides an active slot', () => {
  const status = getStallStatus(
    { isEmergencyClosed: true, operatingHours: FRI_NIGHT },
    at('2026-09-18T23:30:00'),
  );
  expect(status).toEqual({ status: 'CLOSED', isEmergency: true, label: 'Closed' });
});

test('no operating hours is closed', () => {
  expect(getStallStatus(schedule([]), at('2026-09-18T23:30:00'))).toEqual({
    status: 'CLOSED',
    isEmergency: false,
    label: 'Closed',
  });
});

test('HH:mm (API input) and HH:mm:ss (Postgres) parse identically', () => {
  const now = at('2026-09-18T23:30:00');
  expect(getStallStatus(schedule([slot(5, '22:00', '04:00')]), now)).toEqual(
    getStallStatus(schedule(FRI_NIGHT), now),
  );
});

test('host timezone never changes the result', () => {
  const original = process.env.TZ;
  const now = at('2026-09-19T02:30:00');
  const expected = getStallStatus(schedule(FRI_NIGHT), now);
  try {
    for (const tz of ['UTC', 'America/New_York', 'Pacific/Kiritimati']) {
      process.env.TZ = tz;
      expect(getStallStatus(schedule(FRI_NIGHT), now)).toEqual(expected);
    }
  } finally {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  }
});
