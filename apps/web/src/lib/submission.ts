import type { AppType } from '@midnightmunches/api';
import { env } from '@midnightmunches/env/client';
import {
  type MediaType,
  type SubmissionInput,
  uploadContentTypeSchema,
} from '@midnightmunches/types/submission';
import { hc } from 'hono/client';
import { z } from 'zod';

import { CATEGORIES } from './stalls';

export const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

// Colombo city zones match the "Colombo 03" style already in the data; plain "Colombo" covers
// the district's suburbs (Dehiwala, Nugegoda...).
export const DISTRICTS = [
  ...Array.from({ length: 15 }, (_, i) => `Colombo ${String(i + 1).padStart(2, '0')}`),
  ...['Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya', 'Galle', 'Matara'],
  ...['Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu', 'Batticaloa'],
  ...['Ampara', 'Trincomalee', 'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa'],
  ...['Badulla', 'Monaragala', 'Ratnapura', 'Kegalle'],
];

// "street-food" -> "Street Food", matching the casing of existing stall data.
export const FOOD_TYPES = CATEGORIES.map((category) =>
  category.replace('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()),
);

export type HoursRow = {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  isOvernight: boolean;
};

// Undefined base URL resolves against the current origin, same as the auth client.
const api = hc<AppType>(env.NEXT_PUBLIC_API_URL ?? '', { init: { credentials: 'include' } }).api;

const apiErrorSchema = z.object({ error: z.object({ code: z.string(), message: z.string() }) });

export function createDefaultHours(): HoursRow[] {
  return DAYS.map(() => ({
    isOpen: false,
    openTime: '20:00',
    closeTime: '02:00',
    isOvernight: true,
  }));
}

/** Rows keyed by day index. The Overnight tick is the contributor's intent, checked against the times. */
export function getHoursErrors(rows: HoursRow[]) {
  const errors: Record<string, string> = {};

  rows.forEach((row, day) => {
    if (!row.isOpen) return;
    if (!row.openTime || !row.closeTime) {
      errors[`hours.${day}`] = `${DAYS[day]}: set both times`;
      return;
    }

    // Same rule the API uses to derive `isOvernight`; open === close is a 24h window.
    const isCrossingMidnight = row.closeTime <= row.openTime;
    if (isCrossingMidnight && !row.isOvernight) {
      errors[`hours.${day}`] =
        `${DAYS[day]}: closes before it opens. Tick Overnight if it runs past midnight`;
    } else if (!isCrossingMidnight && row.isOvernight) {
      errors[`hours.${day}`] = `${DAYS[day]}: overnight hours must close after midnight`;
    }
  });

  return errors;
}

export function toOperatingHours(rows: HoursRow[]): SubmissionInput['operatingHours'] {
  return rows.flatMap(({ isOpen, openTime, closeTime }, dayOfWeek) =>
    isOpen ? [{ dayOfWeek, openTime, closeTime }] : [],
  );
}

/** Form field names equal the schema paths, so validation issues map straight back to inputs. */
export function toSubmissionInput(formData: FormData, hours: HoursRow[]): SubmissionInput {
  const getText = (name: string) => {
    const value = formData.get(name);
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
  };
  // NaN fails the schema with "Drop a pin", where Number('') would pass as 0.
  const getNumber = (name: string) => Number(getText(name) ?? Number.NaN);

  const deliveryUrls = {
    ubereats: getText('deliveryUrls.ubereats'),
    pickme: getText('deliveryUrls.pickme'),
    direct: getText('deliveryUrls.direct'),
  };

  return {
    name: getText('name') ?? '',
    address: getText('address') ?? '',
    district: getText('district') ?? '',
    latitude: getNumber('latitude'),
    longitude: getNumber('longitude'),
    phone: getText('phone'),
    deliveryUrls: Object.values(deliveryUrls).some(Boolean) ? deliveryUrls : undefined,
    foodTypes: formData.getAll('foodTypes').filter((value) => typeof value === 'string'),
    operatingHours: toOperatingHours(hours),
  };
}

export function toFieldErrors(issues: z.core.$ZodIssue[]) {
  const errors: Record<string, string> = {};
  for (const issue of issues) errors[issue.path.join('.')] ??= issue.message;
  return errors;
}

/** Presign with the API, then PUT the bytes straight to R2. Resolves to the stored media entry. */
export async function uploadMedia(file: File, type: MediaType) {
  const contentType = uploadContentTypeSchema.parse(file.type);
  const presign = await api.upload.presign.$post({
    json: { type, contentType, size: file.size },
  });
  if (!presign.ok) throw new Error(await getErrorMessage(presign));
  const { uploadUrl, publicUrl } = await presign.json();

  // The browser sets Content-Length from the File, which must equal the signed size.
  const put = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'content-type': contentType },
    body: file,
  });
  if (!put.ok) throw new Error(`Upload of ${file.name} failed (${put.status})`);

  return { type, url: publicUrl };
}

export async function submitStall(input: SubmissionInput) {
  const res = await api.restaurants.$post({ json: input });
  if (!res.ok) throw new Error(await getErrorMessage(res));
  return res.json();
}

async function getErrorMessage(res: { status: number; json(): Promise<unknown> }) {
  const body = apiErrorSchema.safeParse(await res.json().catch(() => null));
  if (!body.success) return `Request failed (${res.status})`;
  // Sessions can lapse while a long form is open.
  if (body.data.error.code === 'UNAUTHORIZED') return 'Session expired. Sign in again to submit';
  return body.data.error.message;
}
