# Aumor — Pet Adoption Platform

A Nuxt 4 fullstack app where the public browses adoptable pets and submits
adoption applications, and company staff manage pets, vaccines, applications,
and staff invitations from a gated admin panel.

## Stack

| Layer | Tech |
|---|---|
| Framework | Nuxt 4 (Nitro server), TypeScript |
| Database | Postgres (Neon in prod, Docker locally) + Drizzle ORM |
| Auth | BetterAuth (email + password; Google scaffolded) + admin plugin |
| Validation | Zod (shared `shared/schemas`) |
| Client state | Pinia (`useAuthStore`) |
| Server state | TanStack Query |
| Tables | TanStack Table |
| UI | shadcn-vue + Tailwind CSS v4 |
| Tests | Vitest + @nuxt/test-utils (unit/integration), Playwright (E2E) |

## Architecture

The server follows a layered, SOLID design:

```
API route (controller)  → validates input (Zod), maps to HTTP
  → Service              → business rules (depends on repository interfaces)
    → Repository         → Drizzle data access (the only layer touching the DB)
Ports: ImageStorage, EmailSender, IdentityProvider — swappable adapters
Composition root: server/utils/services.ts
```

- `(public)` and `(private)` route groups under `app/pages/`. Private routes use
  the `staff` middleware (admin + staff) and `admin` middleware (admin-only);
  every `/api/admin/**` route also enforces this server-side.
- Roles: `admin`, `staff`, `adopter`. Adopters self-register and can never reach
  the admin panel. Staff join via an **admin-issued email invitation**.
- Images are URL-only in v1 behind the `ImageStorage` port (swap to Vercel Blob
  later via one adapter).

See [docs/plans/aumor-plan.md](docs/plans/aumor-plan.md) for the full design.

## Prerequisites

- Node 20+ (24 recommended), pnpm 11+, Docker (for local Postgres).

## Local development

```bash
cp .env.example .env            # adjust secrets as needed
docker compose up -d db         # local Postgres on :5432
pnpm install
pnpm db:migrate                 # apply migrations
pnpm db:seed                    # create the first admin + reference species
pnpm dev                        # http://localhost:3000
```

Default seeded admin (override via `.env`): `admin@aumor.local` / `ChangeMe123!`.

### Run everything in Docker

```bash
docker compose up --build       # db + app (Nuxt dev server) on :3000
```

## Database

- `pnpm db:generate` — generate a migration from `server/database/schema`.
- `pnpm db:migrate` — apply pending migrations.
- `pnpm db:seed` — seed the first admin and reference data (idempotent).
- `pnpm db:studio` — open Drizzle Studio.

## Testing

```bash
pnpm test:unit                  # services (mocked repos), schemas, store
docker compose -f docker-compose.test.yml up -d   # test Postgres on :5433
TEST_DATABASE_URL=postgresql://aumor_test:aumor_test@localhost:5433/aumor_test \
  pnpm test:integration         # repositories against real Postgres
pnpm test:e2e                   # Playwright (needs a built + seeded app)
```

`pnpm lint`, `pnpm typecheck`, and `pnpm test` run in CI (`.github/workflows/ci.yml`).

## Staff invitation flow

1. An admin opens **Admin → Staff** and invites an employee by email.
2. The invite link is emailed (logged to the server console in dev:
   `…/register?invite=<token>`).
3. The employee opens the link, registers, and is granted the invited role; a
   `staff_profile` is created. Plain registration always creates an `adopter`.

## Deployment (Vercel + Neon)

1. Create a Neon Postgres database and copy the **pooled** connection string.
2. Import the GitHub repo into Vercel (Nuxt is auto-detected).
3. Set Vercel environment variables:
   - `DATABASE_URL` — Neon pooled connection string (`sslmode=require`)
   - `BETTER_AUTH_SECRET` — `openssl rand -base64 32`
   - `BETTER_AUTH_URL`, `NUXT_PUBLIC_AUTH_BASE_URL` — your production URL
   - (optional) `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` to enable Google login
4. Run migrations against Neon once per release: `pnpm db:migrate` with
   `DATABASE_URL` pointed at Neon (locally or in a CI step), then `pnpm db:seed`
   to create the first admin.
5. Vercel builds previews per PR and deploys production from `main`.

## Enabling Google login

Google is scaffolded but disabled until credentials exist. Set
`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` and the provider activates
automatically (see `server/utils/auth.ts`).
