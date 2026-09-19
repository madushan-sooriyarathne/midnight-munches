import {
  MAX_UPLOAD_BYTES,
  mediaTypeSchema,
  type UploadContentType,
  uploadContentTypeSchema,
} from '@midnightmunches/types/submission';
import { Hono } from 'hono';
import { z } from 'zod';

import { presignUpload } from '../lib/r2';
import { validator } from '../lib/validator';
import { requireSession } from '../middleware/auth';

// Extension comes from the whitelisted MIME type, never from the client's filename.
const EXTENSIONS: Record<UploadContentType, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const presignSchema = z.object({
  type: mediaTypeSchema,
  contentType: uploadContentTypeSchema,
  size: z.number().int().min(1).max(MAX_UPLOAD_BYTES),
});

// Keyed by uploader, not restaurant: files go up before the submission creates the stall.
// `POST /api/restaurants` only accepts media URLs under the caller's own prefix.
export const uploadRoutes = new Hono().post(
  '/presign',
  requireSession(),
  validator('json', presignSchema),
  async (c) => {
    const { type, contentType, size } = c.req.valid('json');
    const { user } = c.get('session');

    const key = `uploads/${user.id}/${type}-${crypto.randomUUID()}.${EXTENSIONS[contentType]}`;

    return c.json(await presignUpload(key, contentType, size));
  },
);
