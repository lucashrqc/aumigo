# Backend

Nitro server (Nuxt `server/`) + Postgres via Drizzle ORM. Layered design:
controller → service → repository, with swappable ports. See
[architecture.md](architecture.md) for the big picture.

## Stack

- **Runtime:** Nitro (h3). Node 22+.
- **DB:** Postgres — Neon serverless in prod/Vercel, Docker Postgres locally.
  Driver auto-selected by URL in `server/database/client.ts` (Neon WebSocket pool
  vs. node-postgres pool; only Neon/node pools support transactions).
- **ORM:** Drizzle (`casing: snake_case`; schema in TS).
- **Auth:** BetterAuth (email+password, Google scaffolded) + admin plugin.
- **Validation:** Zod schemas from `#shared/schemas`.

## Folder structure

```
server/
  api/**              HTTP routes (file-based). /api/admin/** = staff/admin only.
                      /api/me/** = current user. Public: /api/pets, /api/species,
                      /api/breeds, /api/locations/**. Auth at /api/auth/[...all].
  services/**         Business logic (one class per aggregate). Pure, testable.
                      pet, vaccine, adoption, staff, catalog, location, profile,
                      address, identity.
  repositories/**     Drizzle data access (Drizzle<Name>Repository implements <Name>Repository).
  database/
    schema/           Drizzle tables: auth.ts, domain.ts, enums.ts, columns.ts, relations.ts
    migrations/       Generated SQL + journal (DO NOT hand-edit)
    client.ts         createDatabase(url) — driver selection
    migrate.ts        pnpm db:migrate entrypoint
    seed.ts           pnpm db:seed — first admin + reference species (idempotent)
    seed-locations.ts pnpm db:seed:locations — BR states + cities from IBGE API
  storage/            ImageStorage port (UrlImageStorage) + BlobStorage port
                      (VercelBlobStorage / DisabledBlobStorage) for uploads
  email/              EmailSender port + ConsoleEmailSender/ResendEmailSender adapters
  utils/              auth.ts, db.ts, session.ts, services.ts (composition root),
                      validation.ts, identity-provider.ts
```

## Domain model

Tables (`server/database/schema/domain.ts`): `state` / `city` / `address`
(BR locations + per-user address), `species` / `breed`, `pet` / `petImage`,
`vaccine` / `appliedVaccine`, `adoptionApplication`, `staffProfile` /
`staffInvitation`. Enums (`enums.ts`): user role, pet sex/size/status,
application status, invitation role.

## Code patterns

- **API route** = thin controller: guard → validate → delegate → return.
  ```ts
  export default defineEventHandler(async (event) => {
    const session = await requireStaff(event)              // authz (session.ts)
    const id = useUuidParam(event, 'id')                   // param (validation.ts)
    const input = await useValidatedBody(event, someSchema) // body (validation.ts)
    return useSomeService().doThing(id, input, session.user.id)
  })
  ```
  Route file naming is Nitro convention: `index.get.ts`, `[id].patch.ts`,
  `[id]/review.post.ts`.
- **Validation helpers** (`server/utils/validation.ts`): `useValidatedBody`,
  `useValidatedQuery` (both throw 422 with field errors), `useUuidParam` (400).
- **Authz helpers** (`server/utils/session.ts`): `requireUser` (401),
  `requireStaff` (admin+staff, 403), `requireAdmin` (403). `/api/admin/**` always
  calls `requireStaff`/`requireAdmin` — never trust client middleware alone.
- **Services** take repository/port interfaces via constructor; throw `createError`
  for HTTP errors. Wired only in `server/utils/services.ts` via `useXService()`.
- **Repositories** are the only DB-touching layer; each exposes an interface the
  service depends on. Multi-step writes use `db.transaction`.
- `useDb()` returns a lazy, process-wide Drizzle client (reused across requests).

## Auth flow

**Roles:** `admin`, `staff`, `adopter` (stored on `user.role`, default `adopter`).
BetterAuth is mounted at `/api/auth/**` (`server/api/auth/[...all].ts`); config in
`server/utils/auth.ts`. Google activates automatically once
`GOOGLE_CLIENT_ID`/`SECRET` are set.

```
Adopter self-registration
  Browser: authClient.signUp.email()  ──►  /api/auth/**  ──►  user created, role=adopter (autoSignIn)

Staff invitation (admin-issued)
  1. Admin → Staff → invite(email, role)
     POST /api/admin/invitations  ──►  StaffService.invite()
       → create staff_invitation (token, 7-day expiry)
       → EmailSender.send(link = {appBaseUrl}/register?invite=<token>)   [logged to console in dev]
  2. Invitee opens /register?invite=<token>  (register.vue detects token)
     POST /api/invitations/accept  ──►  StaffService.acceptInvitation()
       → validate token (not expired/used)
       → IdentityProvider.createUser()  (BetterAuth signUpEmail)
       → setRole(invited role)  +  create staff_profile  +  mark invitation accepted
  3. Invitee signs in at /login  →  redirected to /admin

Session use (every request)
  Plugin app/plugins/auth.ts → useAuthStore.fetchSession() → GET /api/auth/get-session
  API routes re-check role server-side via requireUser / requireStaff / requireAdmin
```

Plain `/register` (no `?invite`) always yields an `adopter`; adopters can never
reach the admin panel. The BetterAuth admin plugin's privileged ops are limited
to `admin` (`adminRoles: ['admin']`); domain admin-panel access (staff+admin) is
enforced by `requireStaff`.

## Run locally (app + DB in Docker)

Postgres in Docker, everything else on the host:

```bash
cp .env.example .env
docker compose up -d db          # local Postgres on :5432
pnpm install
pnpm db:migrate
pnpm db:seed                     # first admin + reference species (idempotent)
pnpm db:seed:locations           # BR states + cities (optional, from IBGE API)
pnpm dev                         # http://localhost:3000
```

Seeded admin (override in `.env`): `admin@aumor.local` / `ChangeMe123!`.

## Run everything in Docker

The `app` service (Dockerfile `dev` target) runs the Nuxt dev server with the
repo bind-mounted, so host edits hot-reload inside the container:

```bash
docker compose up --build        # db + app on :3000
docker compose down              # stop (volume aumor_pgdata persists data)
```

`node_modules` and `.nuxt` live in anonymous volumes (not bind-mounted from the
host), so after changing dependencies you must install **inside** the container
and restart — a host `pnpm install` won't touch the container's volume:

```bash
docker compose exec -T app pnpm install    # update node_modules in the container volume
docker compose restart app                 # reload Nitro/Vite with the new deps
```

Run migrations/seed against the Dockerized app the same way:

```bash
docker compose exec -T app pnpm db:migrate
docker compose exec -T app pnpm db:seed
```

## Database (Drizzle)

```bash
pnpm db:generate                 # generate a migration from schema changes
pnpm db:migrate                  # apply pending migrations
pnpm db:push                     # push schema without a migration (dev only)
pnpm db:seed                     # seed first admin + reference species
pnpm db:seed:locations           # seed BR states + cities (IBGE)
pnpm db:studio                   # Drizzle Studio
```

Workflow for schema changes: edit `server/database/schema/**` → `pnpm db:generate`
→ review the generated SQL → `pnpm db:migrate`.

## Environment

Server-only (read in `nuxt.config.ts` runtimeConfig): `DATABASE_URL`,
`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID/SECRET`,
`RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `BLOB_READ_WRITE_TOKEN`. Public:
`NUXT_PUBLIC_AUTH_BASE_URL`, `NUXT_PUBLIC_SITE_URL`,
`NUXT_PUBLIC_CF_ANALYTICS_TOKEN`. Seed: `SEED_ADMIN_EMAIL/PASSWORD/NAME`. See
`.env.example`.

Email: when `RESEND_API_KEY` is set, `services.ts` wires `ResendEmailSender`
(from-address `RESEND_FROM_EMAIL`, default `onboarding@resend.dev`); otherwise
it falls back to `ConsoleEmailSender`, which logs messages to stdout.

Image uploads: when `BLOB_READ_WRITE_TOKEN` is set, `services.ts` wires
`VercelBlobStorage`; otherwise `DisabledBlobStorage` (upload endpoints return
501). Uploads are client-direct — the browser sends bytes straight to Vercel
Blob after the token endpoints (`/api/admin/uploads/pet-image`,
`/api/me/avatar-upload`) authorize and scope a token. Create a separate Blob
store for local dev so uploads stay out of production data.
