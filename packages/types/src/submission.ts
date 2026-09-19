import { z } from 'zod';

export const SRI_LANKA_BOUNDS = { minLat: 5.9, maxLat: 9.9, minLng: 79.6, maxLng: 81.9 } as const;

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const MAX_MEDIA = 10;

export const uploadContentTypeSchema = z.enum(['image/jpeg', 'image/png', 'image/webp']);
// Mirrors the `media_type` pgEnum; the api's media insert stops compiling if the two drift.
export const mediaTypeSchema = z.enum(['cover', 'menu', 'photo']);

const PIN_ERROR = 'Pin must be inside Sri Lanka';

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Expected HH:mm');
// Rendered as links on the web app, so no javascript:/data: schemes.
const linkSchema = z.url({ protocol: /^https?$/, error: 'Use a full https:// link' });

// Mobiles (07x) and landlines (011, 081...) are both 0 + 9 digits, or +94 + the same 9.
const phoneSchema = z
  .string()
  .transform((value) => value.replace(/[\s-]/g, ''))
  .pipe(z.string().regex(/^(?:\+94|0)[1-9]\d{8}$/, 'Use a Sri Lankan number, e.g. 077 123 4567'))
  .transform((value) => value.replace(/^0/, '+94'));

/** Crowdsourced stall submission: validated by the web form and again by `POST /api/restaurants`. */
export const submissionSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  address: z.string().trim().min(1, 'Address is required').max(500),
  district: z.string().trim().min(1, 'Pick a district').max(64),
  latitude: z
    .number({ error: 'Drop a pin on the map' })
    .min(SRI_LANKA_BOUNDS.minLat, PIN_ERROR)
    .max(SRI_LANKA_BOUNDS.maxLat, PIN_ERROR),
  longitude: z
    .number({ error: 'Drop a pin on the map' })
    .min(SRI_LANKA_BOUNDS.minLng, PIN_ERROR)
    .max(SRI_LANKA_BOUNDS.maxLng, PIN_ERROR),
  phone: phoneSchema.optional(),
  deliveryUrls: z
    .object({
      ubereats: linkSchema.optional(),
      pickme: linkSchema.optional(),
      direct: linkSchema.optional(),
    })
    .optional(),
  foodTypes: z
    .array(z.string().trim().min(1).max(32))
    .min(1, 'Pick at least one food type')
    .max(10),
  operatingHours: z
    .array(
      z.object({
        dayOfWeek: z.number().int().min(0).max(6),
        openTime: timeSchema,
        closeTime: timeSchema,
      }),
    )
    .min(1, 'Open at least one day')
    .max(14),
  media: z
    .array(z.object({ type: mediaTypeSchema, url: z.url({ protocol: /^https?$/ }) }))
    .max(MAX_MEDIA, `Up to ${MAX_MEDIA} photos`)
    .default([]),
});

export type SubmissionInput = z.input<typeof submissionSchema>;
export type MediaType = z.infer<typeof mediaTypeSchema>;
export type UploadContentType = z.infer<typeof uploadContentTypeSchema>;
