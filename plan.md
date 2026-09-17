This implementation plan is organized into sequential, LLM-executable prompts. Each step targets an isolated set of files with strict boundaries, deterministic deliverables, and acceptance criteria.

---

### Phase 1: Monorepo Foundation & Design Tokens

**Step 1.1: Turborepo & Bun Workspace Scaffold**

- **Target Paths:** `package.json`, `turbo.json`, `bun.lock`, `packages/tsconfig/*`, `packages/types/*`
- **Objective:** Initialize a Bun-managed Turborepo containing `apps/web`, `apps/dashboard`, `apps/api`, `packages/ui`, `packages/db`, `packages/auth`, and `packages/types`.

- **Task Details:** Configure root workspace scripts (`dev`, `build`, `lint`, `check-types`). Configure `turbo.json` with pipeline caching and topological dependencies (`db:generate` before `build`). Setup shared TypeScript configurations with strict checks across packages.

- **Acceptance Criteria:** `bun install` succeeds; `bun run build` passes on stubbed packages without type errors.

**Step 1.2: Design Tokens & Base Theme in `packages/ui**`

- **Target Paths:** `packages/ui/src/styles/globals.css`, `packages/ui/tailwind.config.ts`, `packages/ui/src/components/*`
- **Objective:** Encode the exact "Blood-red punk poster" visual tokens and CSS variables.

- **Task Details:**
- Add palette tokens: Velvet Wine (`#260212`), Burgundy Stage (`#4f0423`), Electric Red (`#e10600`), Blush Highlight (`#ffc7c6`), Butcher Black (`#000000`), Bone White (`#ffffff`).
- Configure font families: Bebas Neue (Display) and Hubot Sans (Body/UI) with standard line-heights and letter-spacing.
- Enforce design constraints: strictly flat (0 drop shadows), 1px hairline black borders, 15px radius for pills/buttons/nav, 12px for cards, and 38px for feature cards.
- Export primitives: `Button` (filled primary `#e10600` and ghost border `#ffffff`), `FilterPill`, and `Card`.

- **Acceptance Criteria:** Tailwind v4 `@theme` or config accurately generates custom classes; primitives render properly across dark backgrounds without gradient or shadow bleed.

---

### Phase 2: Database, Shared Types & Authentication

**Step 2.1: Drizzle ORM Schema & Migrations (`packages/db`)**

- **Target Paths:** `packages/db/src/schema/*`, `packages/db/src/index.ts`, `packages/db/drizzle.config.ts`
- **Objective:** Construct the core PostgreSQL database schema using Drizzle ORM.

- **Task Details:**
- Define `user`, `session`, and `account` tables matching Better Auth requirements.
- Define `restaurants` (`id`, `name`, `slug`, `address`, `latitude`, `longitude`, `phone`, `delivery_urls`, `status: pending|approved|rejected`, `created_by`).
- Define `operating_hours` (`restaurant_id`, `day_of_week: 0-6`, `open_time`, `close_time`, `is_overnight`).
- Define `reviews` (`restaurant_id`, `user_id`, `rating: 1-5`, `comment`, `created_at`) and `media` (`restaurant_id`, `url`, `type: cover|menu|photo`).
- Generate initial SQL migration files via `drizzle-kit`.

- **Acceptance Criteria:** `bun run db:generate` generates valid SQL; local PostgreSQL instance passes `drizzle-kit migrate`.

**Step 2.2: Better Auth Engine & RBAC Integration (`packages/auth`)**

- **Target Paths:** `packages/auth/src/index.ts`, `packages/auth/src/client.ts`, `packages/auth/src/middleware.ts`
- **Objective:** Centralize session management, Google OAuth, and Role-Based Access Control (`user`, `moderator`, `admin`).

- **Task Details:** Configure Better Auth with Drizzle adapter, Email/Password, Google OAuth provider, and admin plugin. Set cross-domain session cookie configuration (`.midnightmunches.lk`). Export server handlers and unified client bindings for Next.js.

- **Acceptance Criteria:** Successful mock user sign-up, login, and session validation across both server contexts and client hooks.

---

### Phase 3: Backend API Service (`apps/api`)

**Step 3.1: Hono API Routing & Cloudflare R2 Uploads**

- **Target Paths:** `apps/api/src/index.ts`, `apps/api/src/routes/*`, `apps/api/src/lib/r2.ts`
- **Objective:** Create the Hono-on-Bun REST engine powering uploads and spatial/time calculations.

- **Task Details:**
- Setup Hono app with CORS, logging, and error middleware.
- Implement R2 presigned URL generator for image uploads using `@aws-sdk/client-s3` (constrained to cover, menu, and stall photos).
- Implement directory query endpoints (`GET /restaurants`) supporting filters: area, food type, and status.
- Implement crowdsourced submission endpoint (`POST /restaurants`) bound to auth middleware.

- **Acceptance Criteria:** `POST /api/upload/presign` yields signed R2 URLs; restaurant query endpoints return typed JSON payloads.

**Step 3.2: Sri Lankan Overnight Status Engine**

- **Target Paths:** `packages/types/src/time.ts`, `apps/api/src/services/status.ts`
- **Objective:** Deterministic overnight operating status calculator anchored to `Asia/Colombo` (UTC+5:30).

- **Task Details:**
- Build pure utility function parsing `day_of_week`, `open_time`, and `close_time` where `close_time < open_time` indicates overnight spans (e.g., 22:00 to 04:00).
- Return status payload: `"OPEN_NOW"`, `"OPENS_AT"`, or `"CLOSED"` with human-formatted countdown string against `Intl.DateTimeFormat` Colombo time.
- Write exhaustive unit test suite covering: standard daytime spans, overnight windows past midnight, edge boundary hours (e.g. 23:59 vs 00:01), and off-days.

- **Acceptance Criteria:** 100% test pass rate across all edge cases without timezone drift.

---

### Phase 4: Public Directory Frontend (`apps/web`)

**Step 4.1: Sticky Nav & Hero Display Block**

- **Target Paths:** `apps/web/src/app/page.tsx`, `apps/web/src/components/layout/Navbar.tsx`, `apps/web/src/components/home/Hero.tsx`
- **Objective:** Implement the brutalist landing frame and navigation adhering strictly to design tokens.

- **Task Details:**
- Sticky `#000000` nav: 'MIDNIGHT MUNCHES' wordmark in Bebas Neue `#e10600`, navigation links with carets, and pill CTA buttons.
- Hero Section: Centered stack on `#260212`, 14px Hubot Sans uppercase eyebrow bracketed by chevrons (`◂ CRAVINGS AT 2AM ▸`), oversized Bebas Neue headline (line-height 0.73, letter-spacing 0.06em, `#e10600`), and dual CTA buttons.
- Asset decoration: Organic masked food photography floating asymmetrically near typography.

- **Acceptance Criteria:** Responsive mobile-first layout matches the token specs; zero layout shifts on display typography.

**Step 4.2: Stall Directory, Filter Pills & Carousel**

- **Target Paths:** `apps/web/src/components/directory/*`, `apps/web/src/hooks/useGeolocation.ts`
- **Objective:** Deliver the interactive catalog view with zero-cost geolocation sorting.

- **Task Details:**
- Horizontal filter toggle group (15px radius, `#e10600` active state, blush `#ffc7c6` text default).
- Category tabs with circular counter badges.
- 4-column directory grid using 12px radius cards on `#4f0423` surfaces with 1px black borders.
- Card anatomy: High-saturation stall photo, status badge (Electric Green/Red), dynamic overnight hours, phone CTA (`tel:`), online order link, and "DIRECTIONS" ghost button redirecting to `[https://www.google.com/maps/dir/?api=1&destination=LAT,LNG](https://www.google.com/maps/dir/?api=1&destination=LAT,LNG)`.
- Proximity sort using browser `navigator.geolocation` and Haversine formula.

- **Acceptance Criteria:** Stall cards display verified "OPEN NOW" badges; directional CTAs properly invoke native map routing with $0 API overhead.

**Step 4.3: Community Submission Form with Leaflet Map**

- **Target Paths:** `apps/web/src/app/submit/page.tsx`, `apps/web/src/components/map/LocationPicker.tsx`
- **Objective:** Provide a low-overhead coordinate picker and listing submission flow for authenticated users.

- **Task Details:**
- Lazy-load dynamic Leaflet map using free OpenStreetMap tiles.
- Draggable pin marker updating form latitude and longitude inputs automatically.
- Multi-day operating hours matrix input with overnight checkbox toggle.
- Direct-to-R2 image uploader for stall menus and exterior proof shots.
- Submit mutations handled with Zod schema validation.

- **Acceptance Criteria:** Submitting creates a `restaurants` row with `status: 'pending'` and linked operating schedule.

---

### Phase 5: Management & Moderation Portal (`apps/dashboard`)

**Step 5.1: RBAC Middleware & Moderation Queue View**

- **Target Paths:** `apps/dashboard/src/middleware.ts`, `apps/dashboard/src/app/submissions/page.tsx`
- **Objective:** Create a secure admin workspace restricted to `admin` and `moderator` roles.

- **Task Details:**
- Route middleware verifying Better Auth session tokens and user roles.
- Side-by-side verification UI: pending submission data on the left, read-only OSM preview map and uploaded menu images on the right.
- Approval actions: "Approve" (updates status to `approved`), "Quick Edit", and "Reject" (prompts reason dialog).

- **Acceptance Criteria:** Non-admin/moderator users receive a 403 redirect; one-click approval publishes items to the public directory in real-time.

**Step 5.2: Directory CRUD & Emergency Closure Controls**

- **Target Paths:** `apps/dashboard/src/app/listings/*`, `apps/dashboard/src/components/EmergencyToggle.tsx`
- **Objective:** Full catalog control and instant operational overrides.

- **Task Details:**
- Searchable, paginated data table of all approved listings.
- Modal/slide-over for modifying stall metadata, phone numbers, and delivery links.
- Quick-switch "Closed Tonight" emergency override updating a dedicated stall flag without destroying base schedules.
- Moderation interface for flagging or removing abusive community reviews.

- **Acceptance Criteria:** Toggling emergency closure immediately flips stall status to "CLOSED" on `apps/web`.

---

### Phase 6: Production Hardening, CI/CD & Deployment

| Pipeline Stage       | Target Service        | Implementation Details                                                                                                          |
| -------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Containerization** | `docker/Dockerfile.*` | Multi-stage Dockerfiles for `web`, `dashboard`, and `api` utilizing `oven/bun:alpine` to produce slim, non-root runtime images. |

|
| **CI Automation** | `.github/workflows/ci.yml` | Turbo cache, lint checks, type check runs, and unit tests executing on every Pull Request.

|
| **Release & Registry** | `.github/workflows/deploy.yml` | On merge to `main`, build Docker images and push tagged manifests to GitHub Container Registry (`ghcr.io`).

|
| **Orchestration** | Dokploy / VPS | Webhook triggers Dokploy on VPS to pull latest images from `ghcr.io`, run Drizzle migrations, and swap containers zero-downtime.

|
| **DNS & Edge** | Cloudflare CDN | Set shared root domain `.midnightmunches.lk`, edge caching for static assets, and SSL termination. |

**Step 6.1: Smoke Test & Launch Checklist**

1. Test Google OAuth redirect loop on shared domain `.midnightmunches.lk` across both client and admin apps.

2. Upload test stall media to Cloudflare R2 and verify signed URL delivery.

3. Validate Sri Lanka midnight time boundary transition (verify "OPEN NOW" status at 01:00 AM Asia/Colombo).

4. Test native Google Maps direction URI redirection on iOS Safari and Android Chrome.
