import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { parseEnv } from 'node:util';

const MODE_FILES: Record<string, string> = { production: '.env.prod', test: '.env.test' };

/**
 * Loads `.env.local`, `.env.{dev|prod|test}` (from NODE_ENV) and `.env` from `startDir` up to the
 * monorepo root (the dir holding `bun.lock`). First value wins: real env > nearer dir > file order,
 * so Docker/CI-injected vars always beat files.
 */
export function loadEnvFiles(startDir = process.cwd()) {
  const modeFile = MODE_FILES[process.env.NODE_ENV ?? ''] ?? '.env.dev';

  for (let dir = startDir; ; dir = dirname(dir)) {
    for (const file of ['.env.local', modeFile, '.env']) {
      const path = join(dir, file);
      if (!existsSync(path)) continue;

      for (const [key, value] of Object.entries(parseEnv(readFileSync(path, 'utf8')))) {
        process.env[key] ??= value;
      }
    }

    if (existsSync(join(dir, 'bun.lock')) || dirname(dir) === dir) return;
  }
}

loadEnvFiles();
