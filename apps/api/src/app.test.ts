import { afterAll, beforeAll, expect, test } from 'bun:test';
import { hc } from 'hono/client';
import { z } from 'zod';

import type { AppType } from './index';

// Needs a migrated local Postgres and DATABASE_URL set. Presigning is offline, so fake R2 creds do.
process.env.BETTER_AUTH_SECRET ??= `${crypto.randomUUID()}${crypto.randomUUID()}`;
process.env.BETTER_AUTH_URL ??= 'http://localhost:4000';
process.env.TRUSTED_ORIGINS ??= 'http://localhost:3000';
process.env.GOOGLE_CLIENT_ID ??= 'test-client-id';
process.env.GOOGLE_CLIENT_SECRET ??= 'test-client-secret';
process.env.R2_ACCOUNT_ID ??= 'test-account';
process.env.R2_ACCESS_KEY_ID ??= 'test-key';
process.env.R2_SECRET_ACCESS_KEY ??= 'test-secret';
process.env.R2_BUCKET_NAME ??= 'test-bucket';
process.env.R2_PUBLIC_DOMAIN ??= 'https://media.example.com';

// Dynamic imports: env must be set before the modules validate it on load.
const { app } = await import('./index');
const { auth } = await import('@midnightmunches/auth');
const { client } = await import('@midnightmunches/db');

// Typed RPC client over the in-process app: success bodies are typed from the routes themselves.
const api = hc<AppType>('http://localhost', { fetch: app.request }).api;
const errorSchema = z.object({ error: z.object({ code: z.string(), message: z.string() }) });

const email = `api-test-${crypto.randomUUID()}@example.com`;
const password = crypto.randomUUID();
// Unique per run so list filters only ever match this test's rows.
const district = `Test ${crypto.randomUUID().slice(0, 8)}`;
let headers: Record<string, string> = {};

const submission = {
  name: 'Hela Kottu Kadé',
  address: '12 Galle Road',
  district,
  latitude: 6.9,
  longitude: 79.85,
  foodTypes: ['Kottu'],
  operatingHours: [{ dayOfWeek: 5, openTime: '22:00', closeTime: '04:00' }],
};

// Untyped POST for payloads the RPC client would (rightly) refuse to compile.
function postRaw(path: string, body: unknown) {
  return app.request(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

async function errorCode(res: { json(): Promise<unknown> }) {
  return errorSchema.parse(await res.json()).error.code;
}

beforeAll(async () => {
  await auth.api.signUpEmail({ body: { email, password, name: 'API Test' } });
  await client`update "user" set email_verified = true where email = ${email}`;
  const signIn = await auth.api.signInEmail({ body: { email, password }, returnHeaders: true });
  const cookie = signIn.headers
    .getSetCookie()
    .map((header) => header.split(';')[0])
    .join('; ');
  headers = { cookie };
});

afterAll(async () => {
  await client`delete from restaurants where district = ${district}`;
  await client`delete from "user" where email = ${email}`;
  await client.end();
});

test('health and error shape', async () => {
  expect((await app.request('/healthz')).status).toBe(200);

  const missing = await api.restaurants[':slug'].$get({ param: { slug: 'does-not-exist' } });
  expect(missing.status).toBe(404);
  expect(await errorCode(missing)).toBe('NOT_FOUND');
});

test('submission is pending until approved', async () => {
  expect<number>((await api.restaurants.$post({ json: submission })).status).toBe(401);

  const invalid = await postRaw('/api/restaurants', { ...submission, operatingHours: [] });
  expect(invalid.status).toBe(400);
  expect(await errorCode(invalid)).toBe('VALIDATION_FAILED');

  const created = await api.restaurants.$post({ json: submission }, { headers });
  if (created.status !== 201) throw new Error(`expected 201, got ${created.status}`);
  const restaurant = await created.json();
  expect(restaurant.status).toBe('pending');
  expect(restaurant.latitude).toBe(6.9);
  expect(restaurant.slug).toMatch(/^hela-kottu-kade-[0-9a-f]{6}$/);

  const [hours] = await client`
    select is_overnight from operating_hours where restaurant_id = ${restaurant.id}`;
  expect(hours?.is_overnight).toBe(true);

  const query = { district, foodType: 'Kottu' };
  const hidden = await api.restaurants.$get({ query });
  if (hidden.status !== 200) throw new Error(`expected 200, got ${hidden.status}`);
  expect((await hidden.json()).data).toHaveLength(0);

  const pending = { query: { ...query, status: 'pending' } } as const;
  expect((await api.restaurants.$get(pending)).status).toBe(401);
  expect((await api.restaurants.$get(pending, { headers })).status).toBe(403);
  const slug = { param: { slug: restaurant.slug } };
  expect((await api.restaurants[':slug'].$get(slug)).status).toBe(404);

  await client`update restaurants set status = 'approved' where id = ${restaurant.id}`;

  const listed = await api.restaurants.$get({ query });
  if (listed.status !== 200) throw new Error(`expected 200, got ${listed.status}`);
  const { data } = await listed.json();
  expect(data).toHaveLength(1);
  expect(data[0]?.operatingHours).toHaveLength(1);
  expect(data[0]).not.toHaveProperty('createdBy');

  const detail = await api.restaurants[':slug'].$get(slug);
  if (detail.status !== 200) throw new Error(`expected 200, got ${detail.status}`);
  expect((await detail.json()).rating).toEqual({ average: null, count: 0 });
});

test('presign enforces type and size, and scopes keys to the uploader', async () => {
  const json = { type: 'cover', contentType: 'image/jpeg', size: 1024 } as const;
  const presign = api.upload.presign.$post;

  expect((await presign({ json })).status).toBe(401);
  expect((await postRaw('/api/upload/presign', { ...json, contentType: 'image/gif' })).status).toBe(
    400,
  );
  expect((await presign({ json: { ...json, size: 6 * 1024 * 1024 } }, { headers })).status).toBe(
    400,
  );

  const res = await presign({ json }, { headers });
  if (res.status !== 200) throw new Error(`expected 200, got ${res.status}`);
  const { uploadUrl, publicUrl, key } = await res.json();

  expect(key).toMatch(new RegExp(`^uploads/${await getUserId()}/cover-[0-9a-f-]{36}\\.jpg$`));
  expect(publicUrl).toBe(new URL(key, process.env.R2_PUBLIC_DOMAIN).href);
  // Size and type are only enforced by R2 if they're part of the signature.
  const signedHeaders = new URL(uploadUrl).searchParams.get('X-Amz-SignedHeaders');
  expect(signedHeaders?.split(';')).toEqual(['content-length', 'content-type', 'host']);
  expect(uploadUrl).not.toContain('x-amz-checksum');
});

test('submission only accepts media the caller uploaded', async () => {
  const json = { type: 'cover', contentType: 'image/png', size: 2048 } as const;
  const res = await api.upload.presign.$post({ json }, { headers });
  if (res.status !== 200) throw new Error(`expected 200, got ${res.status}`);
  const { publicUrl } = await res.json();

  const foreign = new URL('uploads/someone-else/cover-x.png', process.env.R2_PUBLIC_DOMAIN).href;
  // Starts with the caller's prefix as a string, resolves outside it.
  const escaped = `${publicUrl.slice(0, publicUrl.lastIndexOf('/'))}/../someone-else/cover-x.png`;
  for (const url of [foreign, escaped, 'https://evil.example.com/cover.png']) {
    const rejected = await postRaw('/api/restaurants', {
      ...submission,
      media: [{ type: 'cover', url }],
    });
    expect(rejected.status).toBe(400);
    expect(await errorCode(rejected)).toBe('INVALID_MEDIA');
  }

  const created = await api.restaurants.$post(
    { json: { ...submission, media: [{ type: 'cover', url: publicUrl }] } },
    { headers },
  );
  if (created.status !== 201) throw new Error(`expected 201, got ${created.status}`);
  const { id } = await created.json();

  const rows = await client`select type, url from media where restaurant_id = ${id}`;
  expect([...rows]).toEqual([{ type: 'cover', url: publicUrl }]);
});

async function getUserId() {
  const [row] = await client`select id from "user" where email = ${email}`;
  return z.string().parse(row?.id);
}
