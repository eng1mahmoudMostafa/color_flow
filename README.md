# ColorFlow

Production-ready color-palette platform built with **Next.js 15**, **Prisma 6**, **PostgreSQL** and **Tailwind CSS 3**.

Color-code copying is **locked by default**. Users unlock it for **24 hours** only after completing a **30-second ad** — verified **entirely server-side**.

## Features

- 30+ hand-curated palettes across 17 categories (Dark, Luxury, Ocean, Neon, Gaming, Finance…)
- Deterministic harmony generator (monochromatic, analogous, complementary, split-complementary, triadic, tetradic)
- Per-color detail pages with RGB / HSL / CMYK formats and WCAG 2.1 contrast grades
- Debounced global search (palettes, color names, hex values, categories)
- Anonymous guest sessions + optional accounts (bcrypt + JWT via `jose`)
- Favorites, custom palettes, anonymous aggregate analytics
- Admin dashboard with ad-funnel conversion metrics
- Light/dark theme, accessible components, reduced-motion support

## The 24-hour access model (security design)

The single source of truth for copy access is the **`AccessSession`** database row:

1. `POST /api/ad/start` → creates an `AdSession` (server-generated `startedAt`).
2. `POST /api/ad/verify` → `DemoAdProvider.verifyCompletion()` compares **server clock** elapsed time against the 30-second duration. Client countdowns/localStorage are **never trusted**; fake "completed" payloads fail with `AD_NOT_FINISHED`.
3. On success `expiresAt = serverTime + 24h` is stored in `AccessSession`.
4. Every copy click calls `POST /api/copy/authorize`, which re-checks `serverTime < expiresAt`. The client UI (badge, countdown) is cosmetic only.

Anti-abuse measures: one pending ad session per guest, pending sessions expire, hashed session tokens stored in DB, rate limits on ad start/verify, attempts counter on failed verifications.

> **Ad-provider note:** `DemoAdProvider` simulates the ad for development. Real advertising networks must be integrated per their own SDK requirements and publisher policies — the abstraction (`src/lib/ads/`) accepts any provider implementing `startAd / getAdStatus / verifyCompletion / finishAd`. The 30-second demo flow makes no compliance claim for any ad network.

### Ad creatives are served from external URLs (no server storage)

To keep the hosting storage empty (important on limited free tiers), the admin **never uploads files to the server**. When creating an ad, paste a **direct external link** to the image/video (e.g. a public URL from Imgur, Catbox, Cloudflare R2, a CDN, or your own bucket). Only the link string is saved in the `Advertisement.mediaUrl` column — nothing is written to disk, so the site's storage footprint stays near zero regardless of how many ads you add.

- The upstream upload route (`/api/admin/ads/upload`) and the local `/ads-media/*` file-serving route were removed.
- `mediaType` (IMAGE/VIDEO) is inferred automatically from the URL extension on the client side before saving.
- If you later want to self-host media, host files on a separate object store (S3/R2) and paste those public URLs here — the site will render them directly.

## Quick start

```bash
# 1. Install
npm install

# 2. Start PostgreSQL (or point DATABASE_URL at your own instance)
docker compose up -d

# 3. Configure
copy .env.example .env   # (Windows)  |  cp .env.example .env

# 4. Migrate + seed (30+ palettes + admin account)
npx prisma migrate dev --name init
npm run db:seed

# 5. Run
npm run dev
```

Seeded admin login: `admin@colorflow.dev` / `Admin123!` — **change this in production** (the first registered account also becomes an admin).

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | JWT signing secret (generate: `openssl rand -base64 32`) |
| `AD_PROVIDER` | `demo` (default) or a registered provider key |
| `REDIS_URL` | Optional — swap in Redis-backed rate limiting |
| `RATE_LIMIT_SECRET` | Salt for rate-limit key hashing |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for metadata/sitemap |

## Production

```bash
npx prisma migrate deploy
npm run build
npm start
```

Deploy behind a proxy that sets `X-Forwarded-For` (rate limiting keys off the caller IP). Use a process manager or platform hosting (Vercel/Docker) and a managed PostgreSQL instance. Rotate `AUTH_SECRET` securely and store it in your platform's secret manager.

**Important — `COOKIE_SECURE`:** the `.env` used for local testing sets `COOKIE_SECURE=false` (required because the production build is tested over plain `http://localhost`). On any real hosting with HTTPS, remove this variable (or set it to `true`) so auth cookies are marked Secure again.

### Deploying to Vercel + Neon (free)

InfinityFree (and similar PHP shared hosts) **cannot** run this project — it needs Node.js + PostgreSQL.

1. Push the code to GitHub (`.env` and `uploads/` are already git-ignored).
2. Create a free PostgreSQL database at [neon.tech](https://neon.tech) and copy the connection string.
3. Seed it from your machine: set `DATABASE_URL` to the Neon string in `.env`, then run `npx prisma db push` and `npm run db:seed`.
4. Import the repo on [vercel.com](https://vercel.com) (build command and `postinstall` already handle Prisma).
5. Set the environment variables in Vercel: `DATABASE_URL`, `AUTH_SECRET`, `RATE_LIMIT_SECRET`, `AD_PROVIDER=demo`, `NEXT_PUBLIC_SITE_URL`. **Do not** set `COOKIE_SECURE=false`.
6. For the ad system on Vercel, prefer **external media URLs** (the local `uploads/` folder does not persist on serverless).
7. To use `effect.wuaze.com`: add the domain in Vercel (Settings → Domains) and add a CNAME record `effect → cname.vercel-dns.com` in the InfinityFree DNS manager.


## Project structure

```
prisma/schema.prisma     # User, Palette, Color, Favorite, AccessSession, AdSession, CustomPalette, AnalyticsEvent
prisma/seed.ts           # 37 curated palettes + 10,000 generated + admin user
src/lib/                 # colors, access (24h grant/verify), ads (provider abstraction), auth, session,
                         # rate-limit, validation (zod), palettes service (DB + static fallback), events,
                         # favorites (guest localStorage)
src/app/api/             # REST routes: palettes, colors, search, generator,
                         # ad/start, ad/verify, access/status, copy/authorize, auth/* (admin login only), admin/*, events
src/app/                 # Home, explore, palette/[slug], color/[hex], generator, categories, favorites, admin (+ hidden /admin/login)
src/components/          # Navbar, SearchBar, PaletteCard, FavoriteHeart, ColorModal, AdModal, TryColorsModal, CopyButton, Generator, Toasts…
```
