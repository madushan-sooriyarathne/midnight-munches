import { expect, test } from 'bun:test';

import { type SubmissionInput, submissionSchema } from './submission';

const valid: SubmissionInput = {
  name: 'Hela Kottu Kadé',
  address: '12 Galle Road',
  district: 'Colombo 03',
  latitude: 6.9,
  longitude: 79.85,
  foodTypes: ['Kottu'],
  operatingHours: [{ dayOfWeek: 5, openTime: '22:00', closeTime: '04:00' }],
};

test.each([
  ['077 123 4567', '+94771234567'],
  ['077-123-4567', '+94771234567'],
  ['+94 11 234 5678', '+94112345678'],
  ['0812345678', '+94812345678'],
])('phone %s normalises to %s', (phone, expected) => {
  expect(submissionSchema.parse({ ...valid, phone }).phone).toBe(expected);
});

test.each(['12345', '0012345678', '+1 415 555 0100', '07712345678', 'call me'])(
  'phone %s is rejected',
  (phone) => {
    expect(submissionSchema.safeParse({ ...valid, phone }).success).toBe(false);
  },
);

test.each([
  [5.9, 79.6, true],
  [9.9, 81.9, true],
  [5.89, 79.85, false],
  [6.9, 82, false],
  [51.5, -0.12, false],
])('pin %d,%d inside Sri Lanka: %s', (latitude, longitude, isValid) => {
  expect(submissionSchema.safeParse({ ...valid, latitude, longitude }).success).toBe(isValid);
});

test('media defaults to empty and rejects non-http urls', () => {
  expect(submissionSchema.parse(valid).media).toEqual([]);
  const media = [{ type: 'cover' as const, url: 'javascript:alert(1)' }];
  expect(submissionSchema.safeParse({ ...valid, media }).success).toBe(false);
});
