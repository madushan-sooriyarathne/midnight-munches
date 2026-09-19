import { expect, test } from 'bun:test';

import {
  createDefaultHours,
  FOOD_TYPES,
  getHoursErrors,
  type HoursRow,
  toOperatingHours,
  toSubmissionInput,
} from './submission';

const row = (openTime: string, closeTime: string, isOvernight: boolean): HoursRow => ({
  isOpen: true,
  openTime,
  closeTime,
  isOvernight,
});

test('only open days become operating hours, keyed by day index', () => {
  const hours = createDefaultHours();
  hours[5] = row('22:00', '04:00', true);
  hours[6] = row('00:00', '06:00', false);

  expect(toOperatingHours(hours)).toEqual([
    { dayOfWeek: 5, openTime: '22:00', closeTime: '04:00' },
    { dayOfWeek: 6, openTime: '00:00', closeTime: '06:00' },
  ]);
});

test.each<[string, HoursRow, boolean]>([
  ['overnight ticked and crossing midnight', row('22:00', '04:00', true), true],
  ['same-day window unticked', row('18:00', '23:00', false), true],
  ['24h window ticked', row('00:00', '00:00', true), true],
  ['crossing midnight but unticked', row('22:00', '04:00', false), false],
  ['ticked but same-day', row('00:00', '06:00', true), false],
  ['missing close time', row('22:00', '', true), false],
])('hours check: %s', (_, hoursRow, isValid) => {
  const hours = createDefaultHours();
  hours[3] = hoursRow;
  expect(Object.keys(getHoursErrors(hours))).toEqual(isValid ? [] : ['hours.3']);
});

test('closed days are never checked', () => {
  expect(getHoursErrors(createDefaultHours().map((r) => ({ ...r, isOvernight: false })))).toEqual(
    {},
  );
});

test('form data maps to the submission shape', () => {
  const formData = new FormData();
  formData.set('name', '  Hela Kottu  ');
  formData.set('latitude', '');
  formData.set('longitude', '79.85');
  formData.set('phone', '');
  formData.set('deliveryUrls.pickme', 'https://pickme.lk/hela');
  formData.append('foodTypes', 'Kottu');
  formData.append('foodTypes', 'Street Food');

  const input = toSubmissionInput(formData, createDefaultHours());

  expect(input.name).toBe('Hela Kottu');
  expect(input.latitude).toBeNaN();
  expect(input.longitude).toBe(79.85);
  expect(input.phone).toBeUndefined();
  expect(input.deliveryUrls).toEqual({
    ubereats: undefined,
    pickme: 'https://pickme.lk/hela',
    direct: undefined,
  });
  expect(input.foodTypes).toEqual(['Kottu', 'Street Food']);
  expect(FOOD_TYPES).toContain('Street Food');
});
