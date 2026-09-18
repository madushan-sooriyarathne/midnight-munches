import { isModeratorOrAdmin } from '@midnightmunches/auth/permissions';
import { db, mediaTypeEnum } from '@midnightmunches/db';
import { Hono } from 'hono';
import { z } from 'zod';

import { ApiError } from '../lib/errors';
import { presignUpload } from '../lib/r2';
import { validator } from '../lib/validator';
import { requireSession } from '../middleware/auth';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const contentTypeSchema = z.enum(['image/jpeg', 'image/png', 'image/webp']);

// Extension comes from the whitelisted MIME type, never from the client's filename.
const EXTENSIONS: Record<z.infer<typeof contentTypeSchema>, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const presignSchema = z.object({
  restaurantId: z.uuid(),
  type: z.enum(mediaTypeEnum.enumValues),
  contentType: contentTypeSchema,
  size: z.number().int().min(1).max(MAX_UPLOAD_BYTES),
});

export const uploadRoutes = new Hono().post(
  '/presign',
  requireSession(),
  validator('json', presignSchema),
  async (c) => {
    const { restaurantId, type, contentType, size } = c.req.valid('json');
    const { user } = c.get('session');

    const restaurant = await db.query.restaurants.findFirst({
      where: (r, { eq }) => eq(r.id, restaurantId),
      columns: { createdBy: true },
    });

    if (!restaurant) throw new ApiError(404, 'NOT_FOUND', 'Restaurant not found');
    if (restaurant.createdBy !== user.id && !isModeratorOrAdmin(user.role)) {
      throw new ApiError(403, 'FORBIDDEN', 'Only the submitter or a moderator can upload media');
    }

    const key = `restaurants/${restaurantId}/${type}-${crypto.randomUUID()}.${EXTENSIONS[contentType]}`;

    return c.json(await presignUpload(key, contentType, size));
  },
);
