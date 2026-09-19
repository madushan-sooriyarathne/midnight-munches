import { requireRole } from '@midnightmunches/auth';
import {
  db,
  media as mediaTable,
  operatingHours,
  restaurantStatusEnum,
  restaurants,
  reviews,
} from '@midnightmunches/db';
import { env } from '@midnightmunches/env/r2';
import { submissionSchema } from '@midnightmunches/types/submission';
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
    const { operatingHours: hours, media, ...input } = c.req.valid('json');
    const { user } = c.get('session');

    // `new URL` resolves `..` and `%2e%2e` segments, so the prefix check can't be walked out of.
    const uploadPrefix = new URL(`uploads/${user.id}/`, env.R2_PUBLIC_DOMAIN).href;
    if (media.some(({ url }) => !new URL(url).href.startsWith(uploadPrefix))) {
      throw new ApiError(
        400,
        'INVALID_MEDIA',
        'Media must be uploaded through /api/upload/presign',
      );
    }

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

      // ponytail: URLs are trusted to point at finished uploads; HEAD each object if moderators
      // start seeing broken images.
      if (media.length) {
        await tx
          .insert(mediaTable)
          .values(media.map((item) => ({ ...item, restaurantId: created.id })));
      }

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
