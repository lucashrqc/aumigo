# Aumigo — Pet Adoption Platform

Aumigo is a pet-adoption platform. The public browses adoptable pets and submits
adoption applications; company staff manage pets, vaccines, applications, and
staff invitations from a gated admin panel.

It's a single Nuxt 4 fullstack app: a Vue 3 frontend and a Nitro server backed by
Postgres (Drizzle ORM), with email-and-password auth (BetterAuth).

## Documentation

Deeper docs live in [`docs/`](docs/):

- [docs/architecture.md](docs/architecture.md) — big picture: layers, ports, domain model, request lifecycle.
- [docs/backend.md](docs/backend.md) — server stack, structure, patterns, auth flow, database & Docker.
- [docs/frontend.md](docs/frontend.md) — Nuxt/Vue stack, folder layout, data-fetching & route-guard patterns.
- [docs/testing.md](docs/testing.md) — unit, component, integration, and E2E suites.

## Tech stack

| Layer | Tech |
|---|---|
| Framework | Nuxt 4 (Nitro server), Vue 3, TypeScript |
| Database | Postgres (Neon in prod, Docker locally) + Drizzle ORM |
| Auth | BetterAuth (email + password; Google optional) |
| Validation | Zod (shared between client and server) |
| State | Pinia (client) + TanStack Query (server state) |
| UI | shadcn-vue + Tailwind CSS v4 |
| Tests | Vitest (unit/component/integration), Playwright (E2E) |

## Running locally

### Prerequisites

- **Node.js** 20 or newer (24 recommended)
- **pnpm** 10 or newer
- **Docker** (with the Compose plugin) — for the local Postgres database

### Steps

1. **Clone the repo and enter it.**

   ```bash
   git clone <repo-url> aumigo && cd aumigo
   ```

2. **Set up your local configuration.** Copy the provided example configuration
   and adjust it if needed — for a basic local run the defaults work (Postgres in
   Docker, emails printed to the console, uploads disabled). See
   [docs/backend.md](docs/backend.md#configuration) for what each setting does.

3. **Start Postgres** (runs in Docker on port 5432):

   ```bash
   docker compose up -d db
   ```

4. **Install dependencies:**

   ```bash
   pnpm install
   ```

5. **Set up the database** — apply migrations, seed the first admin + reference
   species, and (optionally) load Brazilian states and cities:

   ```bash
   pnpm db:migrate
   pnpm db:seed
   pnpm db:seed:locations   # optional, fetched from the public IBGE API
   ```

6. **Start the dev server:**

   ```bash
   pnpm dev
   ```

The app is now at **http://localhost:3000**, and the admin panel at
**http://localhost:3000/admin**.

**Default admin login** (created by `pnpm db:seed`): `admin@aumigo.local` /
`ChangeMe123!`.

### Run everything in Docker

To run the database **and** the app (dev server) together:

```bash
docker compose up --build        # db + app on http://localhost:3000
```

Migrations and seeds still need to be run once — see
[docs/backend.md](docs/backend.md#local-setup--docker).

## Optional integrations

Aumigo runs fully without any third-party accounts. These optional integrations
unlock extra features once you provide their keys (configuration details are in
[docs/backend.md](docs/backend.md#configuration)):

- **Google sign-in** — add a Google OAuth client and sign-in with Google turns on
  automatically. Create one in the [Google Cloud Console](https://console.cloud.google.com/)
  under **APIs & Services → Credentials → Create OAuth client ID** (Web
  application), and add `http://localhost:3000` as an authorized origin.
- **Real email delivery** — by default, invitation and password-reset emails are
  printed to the server console. To send real email, use either an SMTP account
  (for Gmail, enable 2-Step Verification and create an
  [App Password](https://myaccount.google.com/apppasswords)) or a
  [Resend](https://resend.com/api-keys) API key.
- **Image uploads** — pet and avatar image uploads require a
  [Vercel Blob](https://vercel.com/docs/vercel-blob) store. Create a Blob store in
  the Vercel dashboard (**Storage**) and copy its read/write token; use a separate
  store for local development. Without it, uploads are disabled.

## Staff invitation flow

1. An admin opens **Admin → Staff** and invites an employee by email.
2. The invite link is emailed (printed to the server console in dev).
3. The employee opens the link, registers, and is granted the invited role; a
   staff profile is created. Plain registration always creates an adopter, who can
   never reach the admin panel.

## Testing

```bash
pnpm test                 # unit + component + integration
pnpm test:e2e             # Playwright (needs a built + seeded app)
```

Integration tests need a throwaway Postgres; full details (including the test
database container) are in [docs/testing.md](docs/testing.md).

`pnpm lint`, `pnpm typecheck`, and `pnpm test` run in CI
(`.github/workflows/ci.yml`).

## Deployment

Production runs on **Vercel + Neon Postgres**. Import the repo into Vercel (Nuxt
is auto-detected), point it at a Neon database (use the pooled connection string),
and provide the production configuration. Run `pnpm db:migrate` and `pnpm db:seed`
against Neon once per release. See [docs/backend.md](docs/backend.md) for details.

**Dev environment:** the `staging` branch deploys to a Vercel Preview environment
with its own Neon database and Blob store. The `Database` workflow
(`.github/workflows/database.yml`) applies migrations to the dev database
whenever `staging` receives new migration files; run it manually from the
Actions tab (with the seed options) to bootstrap a fresh database. It reads
`DATABASE_URL`, `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` from the `dev`
GitHub environment's secrets. Vercel crons only run on Production, so trigger the
blob sweep from `/admin/sweep-blobs` on dev.
