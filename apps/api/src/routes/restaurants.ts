import { requireRole } from '@midnightmunches/auth';
import {
  db,
  operatingHours,
  restaurantStatusEnum,
  restaurants,
  reviews,
} from '@midnightmunches/db';
import { and, arrayContains, avg, count, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';
import { z } from 'zod';

import { ApiError } from '../lib/errors';
import { validator } from '../lib/validator';
import { requireSession } from '../middleware/auth';

const listQuerySchema = z.object({
  district: z.string().trim().min(1).optional(),
  foodType: z.string().trim().min(1).optional(),
  status: z.enum(restaurantStatusEnum.enumValues).default('approved'),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Expected HH:mm');
// Rendered as links on the web app, so no javascript:/data: schemes.
const linkSchema = z.url({ protocol: /^https?$/ }).optional();

const submissionSchema = z.object({
  name: z.string().trim().min(1).max(120),
  address: z.string().trim().min(1).max(500),
  district: z.string().trim().min(1).max(64),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  phone: z.string().trim().min(1).max(32).optional(),
  deliveryUrls: z
    .object({ ubereats: linkSchema, pickme: linkSchema, direct: linkSchema })
    .optional(),
  foodTypes: z.array(z.string().trim().min(1).max(32)).min(1).max(10),
  operatingHours: z
    .array(
      z.object({
        dayOfWeek: z.number().int().min(0).max(6),
        openTime: timeSchema,
        closeTime: timeSchema,
      }),
    )
    .min(1)
    .max(14),
});

// Public callers only see approved stalls; the moderation queue needs a mod/admin session.
// Middleware rather than an early return in the handler, which would erase the RPC response type.
const requireModeratorUnlessApproved = createMiddleware(async (c, next) => {
  // Runs after the query validator, so status is absent or a valid enum value.
  if ((c.req.query('status') ?? 'approved') !== 'approved') {
    const guard = await requireRole(c.req.raw.headers, ['moderator', 'admin']);
    if (!guard.ok) return guard.response;
  }
  await next();
});

export const restaurantRoutes = new Hono()
  .get('/', validator('query', listQuerySchema), requireModeratorUnlessApproved, async (c) => {
    const { district, foodType, status, limit, offset } = c.req.valid('query');

    // Relational query compiles to one SQL statement: no N+1 over hours or media.
    const rows = await db.query.restaurants.findMany({
      where: (r, { and, eq }) =>
        and(
          eq(r.status, status),
          district ? eq(r.district, district) : undefined,
          foodType ? arrayContains(r.foodTypes, [foodType]) : undefined,
        ),
      columns: { createdBy: false },
      with: {
        operatingHours: true,
        media: { where: (m, { eq }) => eq(m.type, 'cover'), limit: 1 },
      },
      orderBy: (r, { desc }) => [desc(r.createdAt), desc(r.id)],
      // One extra row tells us whether another page exists.
      limit: limit + 1,
      offset,
    });

    return c.json({
      data: rows.slice(0, limit),
      nextOffset: rows.length > limit ? offset + limit : null,
    });
  })
  .get('/:slug', validator('param', z.object({ slug: z.string().min(1).max(255) })), async (c) => {
    const { slug } = c.req.valid('param');

    const [restaurant, [rating]] = await Promise.all([
      db.query.restaurants.findFirst({
        where: (r, { and, eq }) => and(eq(r.slug, slug), eq(r.status, 'approved')),
        columns: { createdBy: false },
        with: { operatingHours: true, media: true },
      }),
      db
        .select({ average: avg(reviews.rating), count: count() })
        .from(reviews)
        .innerJoin(restaurants, eq(reviews.restaurantId, restaurants.id))
        .where(and(eq(restaurants.slug, slug), eq(restaurants.status, 'approved'))),
    ]);

    if (!restaurant) throw new ApiError(404, 'NOT_FOUND', 'Restaurant not found');

    return c.json({
      ...restaurant,
      rating: {
        average: rating?.average ? Number(rating.average) : null,
        count: rating?.count ?? 0,
      },
    });
  })
  .post('/', requireSession(), validator('json', submissionSchema), async (c) => {
    const { operatingHours: hours, ...input } = c.req.valid('json');
    const { user } = c.get('session');

    const restaurant = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(restaurants)
        .values({ ...input, slug: toSlug(input.name), status: 'pending', createdBy: user.id })
        .returning();
      if (!created) throw new ApiError(500, 'INSERT_FAILED', 'Could not create restaurant');

      await tx.insert(operatingHours).values(
        hours.map((hour) => ({
          ...hour,
          restaurantId: created.id,
          // Derived, not trusted from the client: a close before the open wraps past midnight.
          isOvernight: hour.closeTime < hour.openTime,
        })),
      );

      return created;
    });

    return c.json(restaurant, 201);
  });

function toSlug(name: string) {
  const base = name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .slice(0, 80)
    .replace(/[\s-]+/g, '-')
    .replace(/^-|-$/g, '');

  // ponytail: random suffix instead of a uniqueness check + retry loop. Sinhala/Tamil names
  // strip to nothing, hence the fallback.
  return `${base || 'stall'}-${crypto.randomUUID().slice(0, 6)}`;
}
