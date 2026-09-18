# Midnight Munches

Turborepo + Bun monorepo: Next.js 15 (web, dashboard), Hono (api), Drizzle + PostgreSQL (db), Tailwind v4.

## Commands

```bash
bun run dev          # Start all apps via Turbo
bun run build        # Build all packages & apps
bun run check-types  # Typecheck monorepo (tsc --noEmit)
bun run lint         # Biome check across repo
bun run format       # Biome format --write
```

## Architecture & Packages

- `apps/web` (Next.js 15 customer web) & `apps/dashboard` (admin dashboard)
- `apps/api` (Hono on Bun, port 4000)
- `packages/db` (Drizzle schema & postgres client) | `packages/auth` (Session types)
- `packages/types` (Zod schemas) | `packages/ui` (Shared React components) | `packages/tailwind-config` (Tailwind v4 `@theme`)

## Mandatory Session Skills & Guidelines

- **Always Load**: MUST load and follow `ponytail` (simplest solution, YAGNI, standard library first), `caveman` (terse, token-efficient), and `i-have-adhd` (lead with action, numbered steps, no fluff) every session.
- **Workflow**: Run `check-types` and `lint` before commits; follow conventional commits.
- **Graphify**: Check `graphify-out/GRAPH_REPORT.md` / `graphify query` for architecture questions.
