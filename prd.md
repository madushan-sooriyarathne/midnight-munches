# Product Requirements Document (PRD) — Updated

**Project Name:** NightBite LK (Working Title)
**Domain:** `.lk`
**Vision:** A community-driven, zero-budget directory mapping verified late-night food spots (12:00 AM – 6:00 AM) across Sri Lanka.

---

## 1. Product Overview & Strategic Constraints

### Problem Statement

Finding late-night dining (kottu, street stalls, short eats, 24/7 diners) in Sri Lanka between 12 AM and 6 AM relies on fragmented word-of-mouth. Standard Google Maps queries frequently show outdated operating hours or closed shutters.

### Solution

A mobile-first, community-sourced web directory showcasing active late-night food stalls with exact operating hours, crowd-sourced verification, menus, and directions.

### Critical Constraints

- **Strict $0 API Cost Policy:** No paid Google Maps Platform APIs (Places API, Geocoding API).
- _Alternative for Directions:_ Standard URI scheme `[https://www.google.com/maps/dir/?api=1&destination=LAT,LNG](https://www.google.com/maps/dir/?api=1&destination=LAT,LNG)` (free, native redirect to Google Maps / Apple Maps).
- _Alternative for Map Views:_ OpenStreetMap (OSM) via Leaflet.js or MapLibre GL with free community tiles.
- _Alternative for Geolocation:_ Manual coordinate pin-drop via Leaflet or native browser Geolocation API (`navigator.geolocation`).

---

## 2. User Roles & Personas

- **Late-Night Diner (Guest / Authenticated):** Searching for immediate food at 2 AM nearby. Needs to verify: _Is it open right now? How do I get there? What can I eat?_
- **Contributor (Authenticated):** Wants to list their favorite midnight spot or correct inaccurate stall information.
- **Moderator / Admin:** Accesses the dedicated dashboard at `apps/dashboard` to review crowd-sourced submissions, moderate reviews, and manage platform listings.

---

## 3. Design System & UI/UX Direction

- **Aesthetic:** Neo-Brutalism meets Minimalist Functionalism.
- Thick high-contrast borders (`2px` to `3px` solid `#000`).
- High-contrast stark backgrounds (Pure White `#FFFFFF` / Deep Dark Charcoal `#121212` for Night Mode).
- Vibrant retro accent pops (Electric Yellow `#FFE600`, Toxic Green `#00FF66`, Hot Coral `#FF4834`).
- Hard drop shadows without blur (`box-shadow: 4px 4px 0px #000`).
- Monospaced/Chunky Sans-Serif typography (Space Grotesk, Syne, or JetBrains Mono).

- **Responsive Paradigm:** Mobile-first layout for `apps/web` (one-handed navigation); clean desktop/tablet-optimized management interface for `apps/dashboard`.

---

## 4. Key Functional Features & Requirements

### 4.1. Authentication & Identity (`better-auth`)

- **Framework:** **Better Auth** integrated centrally across the monorepo.
- **Authentication Strategies:**
- **Email + Password:** Standard credential registration with secure hashing and email verification.
- **Social Logins:**
- **Google OAuth** (Phase 1 / Launch).
- **Apple Sign-In** (Phase 2 / Planned follow-up).

- **Session Sharing & Cross-App Auth:** Shared cookie-based session domain (`.yourdomain.lk`) allowing single sign-on between `apps/web` and `apps/dashboard`.
- **RBAC:** Integrated role management via Better Auth admin/roles plugin (`user`, `moderator`, `admin`).

### 4.2. Public Directory (`apps/web`)

- **Real-Time Status Badge:** Dynamic calculation showing **"OPEN NOW"** (Electric Green) vs. **"OPENS AT XX:XX"** vs. **"CLOSED"** calculated against local Sri Lankan time (`Asia/Colombo`, UTC+5:30), supporting overnight spans crossing midnight (e.g., 10:00 PM – 4:00 AM).
- **Filters & Sort:**
- Area / District (e.g., Colombo 03, Dehiwala, Kandy, Galle).
- Food Type (Halal, Street Kottu, Burgers, Chinese, Tea Kiosk, Bakery).
- Delivery Platform (UberEats, PickMe Food, Direct Phone Delivery).
- Distance / Proximity sorting (browser Geolocation API).

- **Listing Detail View:**
- Hero images, menu photos, and environment shots (Cloudflare R2).
- Operating hour matrix with overnight indicators.
- Quick-action CTAs: _Get Directions_ (URI scheme), _Call Stall_ (`tel:`), _Order Online_ (deep link).

- **Community Submissions & Reviews:**
- Authenticated users can submit new food spots with an interactive OSM coordinate picker.
- 1–5 star reviews, photo uploads, and community tags.

### 4.3. Dedicated Management Dashboard (`apps/dashboard`)

- **Access Control:** Restricted via Better Auth middleware (requires `role: admin` or `role: moderator`).
- **Submission Moderation Queue:**
- View pending community submissions.
- Side-by-side verification: Map coordinate preview, uploaded images, operating hours.
- One-click actions: Approve, Reject (with reason), or Quick Edit before publishing.

- **Listing Management (CRUD):**
- Full catalog control: Update contact details, upload verified menus, toggle emergency closures ("Closed tonight").

- **User & Content Moderation:**
- Review moderation: Delete spam, abuse, or inaccurate ratings.
- User management: View registered users, assign moderator permissions, ban offending accounts.

---

## 5. Technical Architecture & Monorepo Structure

```
                             ┌─────────────────────────┐
                             │    Turborepo (Bun)      │
                             └───────────┬─────────────┘
          ┌──────────────────────────────┼──────────────────────────────┐
          ▼                              ▼                              ▼
┌──────────────────┐           ┌──────────────────┐           ┌──────────────────┐
│    apps/web      │           │  apps/dashboard  │           │    apps/api      │
│   Next.js (App)  │           │   Next.js (App)  │           │   Hono on Bun    │
│  Public Client   │           │ Admin/Mod Portal │           │  Backend Engine  │
└─────────┬────────┘           └─────────┬────────┘           └─────────┬────────┘
          │                              │                              │
          └──────────────────────────────┼──────────────────────────────┘
                                         ▼
                             ┌─────────────────────────┐
                             │      packages/auth      │
                             │  better-auth + plugins  │
                             └───────────┬─────────────┘
                                         ▼
                             ┌─────────────────────────┐
                             │       packages/db       │
                             │ Drizzle ORM + Postgres  │
                             └─────────────────────────┘

```

### Workspace Directory Layout

```
├── apps/
│   ├── web/               # Next.js: Public mobile-first directory & user submissions
│   ├── dashboard/         # Next.js: Internal management & moderation portal
│   └── api/               # Hono (Bun): REST API & background webhooks
├── packages/
│   ├── auth/              # Better Auth configuration, client & server bindings
│   ├── db/                # Drizzle schema, migrations, and PostgreSQL client
│   ├── ui/                # Shared Neo-brutalist Tailwind UI component library
│   ├── tsconfig/          # Shared TypeScript configurations
│   └── types/             # Shared DTOs and Zod validation schemas
└── docker/                # Multi-stage Dockerfiles for web, dashboard, and api

```

### Stack Components

- **Package Manager & Runtime:** Bun.
- **Monorepo Orchestrator:** Turborepo.
- **Frontend Apps:** Next.js (App Router, Tailwind CSS, Lucide Icons).
- **API Service:** Hono on Bun.
- **Authentication:** Better Auth (PostgreSQL adapter, Google OAuth provider, Admin/RBAC plugin).
- **Database & ORM:** PostgreSQL (Self-hosted) with Drizzle ORM.
- **Media Storage:** Cloudflare R2 (S3-compatible, $0 egress, 10 GB free tier).
- **CI/CD & Hosting:**
- GitHub Actions builds Docker images for `web`, `dashboard`, and `api`.
- Images pushed to GitHub Container Registry (`ghcr.io`).
- Dokploy pulls images and manages container lifecycles on the VPS.

---

## 6. PostgreSQL Schema Blueprint (Core Entities)

| Table             | Key Columns                                                                                                                                                                                                                            | Purpose                                         |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `user`            | `id (text/uuid)`, `email (varchar)`, `name (text)`, `role (varchar: user, moderator, admin)`, `created_at`                                                                                                                             | Better Auth core user table                     |
| `session`         | `id (text)`, `user_id (fk -> user.id)`, `token (varchar)`, `expires_at`                                                                                                                                                                | Better Auth session persistence                 |
| `account`         | `id (text)`, `user_id (fk -> user.id)`, `provider_id (e.g. "google")`, `account_id (text)`                                                                                                                                             | Social provider mappings (Google, future Apple) |
| `restaurants`     | `id (uuid)`, `name (text)`, `slug (varchar)`, `address (text)`, `latitude (numeric)`, `longitude (numeric)`, `phone (varchar)`, `delivery_urls (jsonb)`, `status (varchar: pending, approved, rejected)`, `created_by (fk -> user.id)` | Core food stall directory                       |
| `operating_hours` | `id (uuid)`, `restaurant_id (fk -> restaurants.id)`, `day_of_week (smallint 0-6)`, `open_time (time)`, `close_time (time)`, `is_overnight (boolean)`                                                                                   | Day-specific hours with midnight-wrap logic     |
| `reviews`         | `id (uuid)`, `restaurant_id (fk -> restaurants.id)`, `user_id (fk -> user.id)`, `rating (smallint 1-5)`, `comment (text)`, `created_at`                                                                                                | Community ratings and feedback                  |
| `media`           | `id (uuid)`, `restaurant_id (fk -> restaurants.id)`, `url (text)`, `type (varchar: cover, menu, photo)`                                                                                                                                | R2 asset pointers                               |

---

## 7. Phased Implementation Roadmap

### Phase 1: Core Foundation & MVP

- Initialize Turborepo with `apps/web`, `apps/dashboard`, `apps/api`, and `packages/auth`, `packages/db`.
- Implement Drizzle PostgreSQL schema and Better Auth with Email/Password + Google OAuth.
- Build public `apps/web` listing view with dynamic "Open Now" overnight calculator and Leaflet maps.
- Build crowdsource submission form in `apps/web`.
- Build `apps/dashboard` with role protection (`admin`/`moderator`) and submission approval workflow.

### Phase 2: Operations & Engagement

- Implement user reviews, stall ratings, and Cloudflare R2 menu/photo uploads.
- Expand `apps/dashboard` with user role management, listing edit tooling, and audit logs.
- Setup automated GitHub Actions workflows pushing `web`, `dashboard`, and `api` images to GHCR for Dokploy deployment.

### Phase 3: Enhancements

- Integrate Apple Sign-In into Better Auth configuration.
- Add PostGIS spatial indexing for dynamic radius sorting ("Spots within 5 km").
- Implement community edit proposals (crowdsourced updates to existing stall hours).
