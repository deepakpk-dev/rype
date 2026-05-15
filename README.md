# Rype

> A polished grocery storefront for fresh European produce, with a real admin panel — built on Next.js 15, React 19, and Auth.js v5.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4.2-38BDF8?logo=tailwindcss&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-33%20tests-6E9F18?logo=vitest&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-E2E-2EAD33?logo=playwright&logoColor=white)
![Auth.js](https://img.shields.io/badge/Auth.js-v5-7C3AED)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Demo

[![Rype storefront preview](./public/readme-homepage.png)](https://rype-one.vercel.app)

**Live demo:** [`https://rype-one.vercel.app`](https://rype-one.vercel.app)

### Demo accounts

| Role  | Email              | Password   | Access                     |
| ----- | ------------------ | ---------- | -------------------------- |
| admin | `admin@rype.local` | `admin123` | Full panel                 |
| staff | `staff@rype.local` | `staff123` | Orders only                |

Visit `/admin/login` to sign in.

---

## Features

### Storefront
- Product catalog with detail pages, image galleries, and related items
- Fuzzy search powered by Fuse.js
- Persistent cart drawer (Zustand + `localStorage`)
- Wishlist and side-by-side compare tray
- Multi-step checkout that writes a real order into the admin panel and decrements stock
- Confetti on order success because life is short

### Admin (`/admin`)
- Dashboard with KPIs (revenue, orders, low-stock alerts)
- Orders management with status workflow and a detail side drawer
- Inventory with inline stock edits and per-row reset
- Users page (admin-only)
- Role-aware navigation: `staff` sees only orders; `admin` sees everything
- Edge middleware on every `/admin/*` route

---

## Tech stack

**Frontend** — Next.js 15 (App Router, Turbopack), React 19, TypeScript 5.7, Tailwind 3.4, Framer Motion, lucide-react, Zustand 5, react-hook-form + Zod

**Auth** — Auth.js v5 (NextAuth beta) with Credentials + Google OAuth, JWT sessions, bcryptjs password hashing, edge-safe split config

**Data** — Prisma 6 + PostgreSQL (Neon-friendly). Server Actions for all admin mutations.

**Tooling** — ESLint 9, PostCSS, `tsc --noEmit` typecheck, Turbopack dev, Vitest (33 unit tests), Playwright E2E, GitHub Actions CI (lint → typecheck → build → test → e2e), Dependabot

**Planned** — Stripe webhook, Vercel Blob uploads, Resend email, audit log

---

## Architecture

```
                ┌──────────────────────────────────────────────┐
                │                   Browser                    │
                └──────────────────────┬───────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │   Edge Middleware (auth.config.ts)      │
                  │   gates /admin/* on JWT presence        │
                  └─────────────────────┬───────────────────┘
                                        │
                                        ▼
   ┌──────────────────────────────────────────────────────────────────┐
   │                    Next.js 15 App Router                         │
   │  ┌────────────────┐  ┌─────────────────┐  ┌──────────────────┐   │
   │  │ Server         │  │ Client          │  │ API routes       │   │
   │  │ Components     │  │ Components      │  │ /api/auth/[...]  │   │
   │  │ (admin pages,  │  │ (cart, drawer,  │  │ /api/orders      │   │
   │  │  product data) │  │  Zustand stores)│  │ /api/inventory   │   │
   │  └────────────────┘  └─────────────────┘  └──────────────────┘   │
   └─────────────────────────────────┬────────────────────────────────┘
                                     │
                                     ▼
                ┌─────────────────────────────────────────┐
                │  Auth.js v5 (auth.ts, Node runtime)     │
                │  ─ Credentials.authorize()              │
                │  ─ bcrypt.compare(plain, hash)          │
                │  ─ Postgres User table (role per row)   │
                │  ─ Google OAuth — DB lookup by email    │
                └─────────────────────┬───────────────────┘
                                      │
                                      ▼
                ┌─────────────────────────────────────────┐
                │  Signed JWT in httpOnly cookie          │
                │  carries { id, email, role }            │
                └─────────────────────────────────────────┘
```

The split between `auth.config.ts` (edge-safe) and `auth.ts` (Node, with bcrypt) is deliberate — middleware runs on the edge runtime and can't pull in `bcryptjs`.

---

## Getting started

```bash
git clone <your-fork-url> rype
cd rype
npm install

cp .env.local.example .env.local
npx auth secret      # writes AUTH_SECRET into .env.local

# Database (orders are persisted in Postgres via Prisma) — see "Database setup" below
npm run db:push      # create tables from prisma/schema.prisma
npm run db:seed      # insert sample orders

npm run dev          # http://localhost:3000
```

Sign in at [`/admin/login`](http://localhost:3000/admin/login) using the demo credentials above.

### Database setup

Orders live in Postgres (managed via Prisma). The fastest path is the [Neon](https://neon.tech) free tier:

1. Sign up, create a project, copy the **pooled** connection string.
2. Paste it into `.env.local` as `DATABASE_URL`.
3. `npm run db:push` — provisions tables: `User`, `Product`, `Order`, `OrderItem`.
4. `npm run db:seed` — upserts 40 products and the two demo admin/staff users (bcrypt-hashed), then inserts three sample orders.
5. `npm run db:studio` — open Prisma Studio to inspect rows.

The admin dashboard and orders page degrade gracefully (with a banner) if `DATABASE_URL` is missing, so you can still browse the storefront and admin UI without a DB.

### Optional: Google OAuth

1. Create OAuth credentials at [console.cloud.google.com](https://console.cloud.google.com/apis/credentials).
2. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`.
3. Set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` in `.env.local`.
4. Insert a row into the `User` table with that email and the role you want.

---

## Deploy to Vercel

Required environment variables in the Vercel dashboard (**Settings → Environment Variables**):

| Variable             | Source                               | Required |
| -------------------- | ------------------------------------ | -------- |
| `AUTH_SECRET`        | `npx auth secret` or `openssl rand -base64 32` | ✅ |
| `DATABASE_URL`       | Neon pooled connection string        | ✅ |
| `AUTH_GOOGLE_ID`     | Google Cloud OAuth client            | optional |
| `AUTH_GOOGLE_SECRET` | Google Cloud OAuth client            | optional |

If you wire up Google OAuth, add `https://<your-project>.vercel.app/api/auth/callback/google` to the authorized redirect URIs in Google Cloud.

After the first deploy, run `npm run db:push && npm run db:seed` **locally** with the production `DATABASE_URL` to provision tables and seed demo data into Neon.

---

## Project structure

```
.
├── app/                    # App Router routes
│   ├── admin/              # Admin panel (dashboard, orders, inventory, users, login)
│   ├── api/                # Route handlers incl. /api/auth/[...nextauth]
│   ├── checkout/           # Multi-step checkout
│   ├── products/           # Catalog + product detail
│   ├── compare/            # Compare tray page
│   ├── wishlist/           # Wishlist page
│   └── layout.tsx          # Root layout + SessionProvider
├── components/
│   ├── admin/              # Admin-only UI (drawer, KPIs, tables)
│   ├── layout/             # Header, footer, nav
│   ├── product/            # Card, gallery, variants
│   └── ui/                 # Primitives (button, dialog, input)
├── lib/
│   ├── admin-users.ts      # In-memory users + bcrypt verify
│   ├── stores.ts           # Zustand stores (cart, wishlist, compare)
│   ├── session-helpers.ts  # Server-side role guards
│   └── utils.ts
├── data/products.ts        # Seed catalog
├── auth.ts                 # NextAuth root config (Node runtime)
├── auth.config.ts          # Edge-safe config (used by middleware)
├── middleware.ts           # Edge middleware gating /admin/*
├── next.config.ts
└── .env.local.example
```

---

## Decisions & tradeoffs

- **Zustand over Redux/Context** — cart, wishlist, and compare are pure client state with `localStorage` persistence. Zustand's `persist` middleware is one line; Redux Toolkit would be three files of overhead for the same outcome.
- **Auth.js v5 split config** — `auth.config.ts` is edge-safe (no Node-only deps) so middleware can import it. `auth.ts` adds the Credentials provider with `bcryptjs`, which only runs in Node. Following this rule eliminates the most common v5 deployment crash.
- **JWT sessions over database sessions** — JWT keeps `/admin/*` middleware checks O(1) without a round-trip. Will revisit if server-side session revocation becomes a requirement.
- **bcrypt on real Postgres users** — passwords are hashed with bcrypt at seed time and verified through Auth.js Credentials. The shape matches a real production auth system; no plaintext anywhere.
- **Server Actions over API routes** — all admin mutations (`placeOrder`, `setStatus`, `updateProduct`) are typed Server Actions with Zod `safeParse` at the boundary. Removes the need for manual fetch wrappers and keeps mutations colocated with their data.
- **Turbopack dev** — `next dev --turbopack` is the default in Next 15 and worth the speedup for a project this size.
- **Vitest `include` glob scoped to `__tests__/`** — Playwright specs in `e2e/` use `test.describe()` from a different runner; without the explicit include pattern Vitest would try to execute them and error.
- **Read-only E2E against the shared Neon DB** — the Playwright spec makes no mutations, so running it against the same database as the live demo is safe. The seeded admin user and orders are always present after `db:seed`.

---

## Roadmap

| Status         | Item                                                              |
| -------------- | ----------------------------------------------------------------- |
| Done           | Postgres + Prisma (orders, inventory, users)                      |
| Done           | Users table in Postgres (replaced in-memory `ADMIN_USERS`)        |
| Done           | Server Actions for all admin mutations                            |
| Done           | Vitest unit tests (33 tests — stores + cartTotals utility)        |
| Done           | Playwright E2E (admin login → orders → drawer → keyboard close)   |
| Done           | GitHub Actions CI (lint → typecheck → build → unit tests → E2E)  |
| Done           | WCAG AA accessible OrderDrawer (focus trap, ARIA, Escape key)     |
| Done           | WCAG AA color contrast on status badges (processing, cancelled)   |
| Todo           | Stripe webhook + real payment intent (currently test-mode shell)  |
| Todo           | Vercel Blob image upload for product photos                       |
| Todo           | Resend transactional email (order confirmation, password reset)   |
| Todo           | Audit log (who/what/when for admin mutations)                     |

---

## Scripts

| Script                  | Purpose                                                     |
| ----------------------- | ----------------------------------------------------------- |
| `npm run dev`           | Start Next.js dev server with Turbopack                     |
| `npm run build`         | Production build                                            |
| `npm run start`         | Run the production server                                   |
| `npm run lint`          | Lint with `eslint-config-next`                              |
| `npm run typecheck`     | `tsc --noEmit` — strict type check                          |
| `npm run test`          | Vitest unit tests (33 tests, stores + utilities)            |
| `npm run test:watch`    | Vitest in watch mode                                        |
| `npm run test:coverage` | Vitest with V8 coverage report                              |
| `npm run e2e`           | Playwright E2E — requires a build + `DATABASE_URL` in env  |
| `npm run e2e:ui`        | Playwright interactive UI mode                              |

---

## License

MIT.
