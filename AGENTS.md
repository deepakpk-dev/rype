# AGENTS.md

## Project snapshot

Rype is a polished grocery storefront with a real admin panel.

- Framework: Next.js 15 App Router, React 19, TypeScript
- Styling: Tailwind CSS
- Auth: Auth.js v5 with credentials and optional Google OAuth
- Data: Prisma + PostgreSQL
- Client state: Zustand
- Quality gates: ESLint, TypeScript, Vitest, Playwright, GitHub Actions
- Default branch: `main`

The live demo is linked from `README.md`.

## Important architecture notes

- `auth.config.ts` is intentionally edge-safe and imported by `middleware.ts`.
- `auth.ts` contains Node-only auth work such as bcrypt-backed credentials verification.
- `trustHost: true` is required in `auth.config.ts` so local production auth endpoints work correctly.
- Orders and inventory data come from Prisma-backed server actions and queries in `lib/orders/*` and `lib/products/*`.
- Storefront client state lives in `lib/stores.ts`.
- The hero image used on the homepage is configured in `lib/products/presentation.ts`.

## Local setup

```bash
npm install
copy .env.local.example .env.local
npm run db:push
npm run db:seed
npm run dev
```

Required local environment:

- `AUTH_SECRET`
- `DATABASE_URL`

Optional:

- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`

Demo admin users are documented in `README.md`.

## Verification commands

Use these before claiming the app is healthy:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run e2e
```

Notes:

- `npm run typecheck` depends on generated `.next/types`; run `npm run build` first if those files are missing.
- `npm run e2e` expects a running production server and a configured database.
- CI runs the same core checks on `main`.

## Repo hygiene conventions

- Keep local-only artifacts out of git: `.claude/`, `.neon`, `.next/`, `out/`, `test-results/`, local env files, and logs are ignored.
- Keep repo-facing docs polished: `README.md`, `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, and GitHub templates are part of the public presentation.
- Prefer focused pull requests and screenshots for visible UI changes.
- Dependabot backlog should stay curated rather than blindly merged.

## Recent decisions worth preserving

- The homepage hero was recently rebalanced so the image is the focal point and the left content reads as one tighter unit.
- The current hero asset is `public/home-images/rype-market-hero-v2.png`.
- The repository default branch was renamed from `master` to `main`.
- GitHub community health is now fully configured.

## Useful file map

- `app/page.tsx` - homepage and hero layout
- `app/admin/*` - admin dashboard and management UI
- `components/layout/*` - shell, cart drawer, search, compare tray
- `components/product/*` - product cards and filters
- `lib/products/*` - product queries, actions, presentation helpers
- `lib/orders/*` - order queries and actions
- `prisma/schema.prisma` - database schema
- `e2e/admin.spec.ts` - admin happy-path browser test
- `.github/workflows/ci.yml` - CI pipeline

## Working style for future agents

- Read the surrounding code before changing patterns.
- Prefer the repo's existing helpers and structures over new abstractions.
- Keep visual changes restrained, product-focused, and consistent with the current design language.
- For user-facing work, verify both desktop and mobile layouts.
- Do not commit generated files or machine-local configuration.
