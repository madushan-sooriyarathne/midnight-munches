import { afterEach, expect, test } from 'bun:test';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { loadEnvFiles } from './load';

const KEYS = ['MM_PRESET', 'MM_LOCAL', 'MM_MODE', 'MM_BASE', 'MM_NEAR', 'MM_OUTSIDE'];
const dirs: string[] = [];

// outside/.env  ← above the root marker, must never load
// outside/root/{bun.lock,.env,.env.local,.env.test,.env.prod}
// outside/root/apps/web/.env  ← nearer dir, wins over root
function createTree() {
  const outside = mkdtempSync(join(tmpdir(), 'env-load-'));
  const root = join(outside, 'root');
  const app = join(root, 'apps', 'web');
  mkdirSync(app, { recursive: true });
  dirs.push(outside);

  writeFileSync(join(outside, '.env'), 'MM_OUTSIDE=outside');
  writeFileSync(join(root, 'bun.lock'), '');
  writeFileSync(
    join(root, '.env'),
    'MM_PRESET=file\nMM_LOCAL=base\nMM_MODE=base\nMM_BASE=base\nMM_NEAR=root',
  );
  writeFileSync(join(root, '.env.local'), 'MM_LOCAL=local\nMM_MODE=local');
  writeFileSync(join(root, '.env.test'), 'MM_MODE=test');
  writeFileSync(join(root, '.env.prod'), 'MM_MODE=prod');
  writeFileSync(join(app, '.env'), 'MM_NEAR=app');

  return app;
}

afterEach(() => {
  for (const key of KEYS) delete process.env[key];
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

test('real env > nearer dir > .env.local > mode file > .env, stops at bun.lock', () => {
  process.env.MM_PRESET = 'real';

  loadEnvFiles(createTree());

  expect(process.env.MM_PRESET).toBe('real');
  expect(process.env.MM_NEAR).toBe('app');
  expect(process.env.MM_LOCAL).toBe('local');
  expect(process.env.MM_BASE).toBe('base');
  expect(process.env.MM_OUTSIDE).toBeUndefined();
});

test('NODE_ENV picks the mode file', () => {
  const app = createTree();
  // .env.local sets MM_MODE too, so drop it to see the mode file.
  rmSync(join(app, '..', '..', '.env.local'));

  loadEnvFiles(app);

  // bun test runs with NODE_ENV=test.
  expect(process.env.MM_MODE).toBe('test');
});

test('no env files is a no-op', () => {
  const empty = mkdtempSync(join(tmpdir(), 'env-empty-'));
  dirs.push(empty);
  writeFileSync(join(empty, 'bun.lock'), '');

  expect(() => loadEnvFiles(empty)).not.toThrow();
  expect(process.env.MM_BASE).toBeUndefined();
});
