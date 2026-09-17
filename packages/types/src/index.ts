import { z } from 'zod';

export const idSchema = z.string().uuid();

export const currencySchema = z.enum(['LKR', 'USD']);

export const outletStatusSchema = z.enum(['open', 'closing_soon', 'closed']);

export const menuItemSchema = z.object({
  id: idSchema,
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().default(''),
  priceCents: z.number().int().nonnegative(),
  currency: currencySchema.default('LKR'),
  available: z.boolean().default(true),
});

export const outletSchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  status: outletStatusSchema,
  opensAt: z.string().regex(/^\d{2}:\d{2}$/),
  closesAt: z.string().regex(/^\d{2}:\d{2}$/),
});

export const healthResponseSchema = z.object({
  status: z.literal('ok'),
  service: z.string(),
  uptimeSeconds: z.number().nonnegative(),
});

export type Id = z.infer<typeof idSchema>;
export type Currency = z.infer<typeof currencySchema>;
export type OutletStatus = z.infer<typeof outletStatusSchema>;
export type MenuItem = z.infer<typeof menuItemSchema>;
export type Outlet = z.infer<typeof outletSchema>;
export type HealthResponse = z.infer<typeof healthResponseSchema>;
