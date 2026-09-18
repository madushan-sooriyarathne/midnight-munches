import { afterAll, expect, test } from 'bun:test';

import { hasRole, isAdmin, isModeratorOrAdmin } from './permissions';

// Needs a migrated local Postgres and DATABASE_URL set (see the root .env.example).
process.env.BETTER_AUTH_SECRET ??= `${crypto.randomUUID()}${crypto.randomUUID()}`;
process.env.BETTER_AUTH_URL ??= 'http://localhost:4000';
process.env.TRUSTED_ORIGINS ??= 'http://localhost:3000';
process.env.GOOGLE_CLIENT_ID ??= 'test-client-id';
process.env.GOOGLE_CLIENT_SECRET ??= 'test-client-secret';

// Dynamic imports: env must be set before the modules validate it on load.
const { auth, requireRole } = await import('./index');
const { client } = await import('@midnightmunches/db');

const email = `test-${crypto.randomUUID()}@example.com`;
const password = crypto.randomUUID();

afterAll(async () => {
  await client`delete from "user" where email = ${email}`;
  await client.end();
});

test('role checks', () => {
  expect(hasRole('moderator', ['moderator', 'admin'])).toBe(true);
  expect(hasRole('user', ['moderator', 'admin'])).toBe(false);
  expect(hasRole('superuser', ['admin'])).toBe(false);
  expect(hasRole(null, ['user'])).toBe(false);
  expect(isAdmin('admin')).toBe(true);
  expect(isAdmin('moderator')).toBe(false);
  expect(isModeratorOrAdmin('moderator')).toBe(true);
  expect(isModeratorOrAdmin(undefined)).toBe(false);
});

test('sign up, verify, sign in, and guard by role', async () => {
  await auth.api.signUpEmail({ body: { email, password, name: 'Test User' } });
  await expect(auth.api.signInEmail({ body: { email, password } })).rejects.toThrow(
    'Email not verified',
  );

  await client`update "user" set email_verified = true where email = ${email}`;
  const signIn = await auth.api.signInEmail({ body: { email, password }, returnHeaders: true });
  const cookie = signIn.headers
    .getSetCookie()
    .map((header) => header.split(';')[0])
    .join('; ');
  const headers = new Headers({ cookie });

  const current = await auth.api.getSession({ headers });
  expect(current?.user.email).toBe(email);
  expect(current?.user.role).toBe('user');

  const anonymous = await requireRole(new Headers(), ['user']);
  if (anonymous.ok) throw new Error('expected 401 without a session');
  expect(anonymous.response.status).toBe(401);

  const denied = await requireRole(headers, ['moderator', 'admin']);
  if (denied.ok) throw new Error('expected 403 for role "user"');
  expect(denied.response.status).toBe(403);

  await client`update "user" set role = 'moderator' where email = ${email}`;
  const allowed = await requireRole(headers, ['moderator', 'admin']);
  if (!allowed.ok) throw new Error('expected moderator to pass');
  expect(allowed.session.user.role).toBe('moderator');
});
