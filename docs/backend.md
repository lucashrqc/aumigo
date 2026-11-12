# Backend

Nitro server (Nuxt `server/`) + Postgres via Drizzle ORM. Layered design:
controller → service → repository, with swappable ports. See
[architecture.md](architecture.md) for the big picture.

## Stack

- **Runtime:** Nitro (h3). Node 20+ (CI uses 24, Docker uses 22).
- **DB:** Postgres — Neon serverless in prod/Vercel, Docker Postgres locally.
  The driver is auto-selected by URL in `server/database/client.ts`: a
  `neon.tech` URL uses the Neon WebSocket pool, anything else uses node-postgres.
  Both support transactions.
- **ORM:** Drizzle (`casing: snake_case`, schema in TS).
- **Auth:** BetterAuth (email + password, Google scaffolded) + admin plugin.
- **Validation:** Zod schemas from `#shared/schemas`.

## Folder structure

```
server/
  api/**              HTTP routes (file-based). /api/admin/** = staff/admin only.
                      /api/me/** = current user. Public: /api/pets, /api/species,
                      /api/breeds, /api/locations/**. Auth at /api/auth/[...all].
                      /api/maintenance/blob-sweep = cron (requireCronOrAdmin).
  services/**         Business logic (one class per aggregate). Pure, testable:
                      pet, vaccine, adoption, analytics, staff, catalog, location,
                      profile, address, maintenance.
  repositories/**     Drizzle data access (Drizzle<Name>Repository implements <Name>Repository).
  database/
    schema/           Drizzle tables: auth.ts, domain.ts, enums.ts, columns.ts, relations.ts
    migrations/       Generated SQL + journal (DO NOT hand-edit)
    client.ts         createDatabase(url) — driver selection
    migrate.ts        pnpm db:migrate entrypoint (always node-postgres)
    seed.ts           pnpm db:seed — first admin + reference species (idempotent)
    seed-locations.ts pnpm db:seed:locations — BR states + cities from the IBGE API
  storage/            ImageStorage port (UrlImageStorage) + BlobStorage port
                      (VercelBlobStorage / DisabledBlobStorage) for uploads
  email/              EmailSender port + Console/Smtp/Resend adapters
  utils/              auth.ts, db.ts, session.ts, services.ts (composition root),
                      validation.ts, identity-provider.ts
```

## Domain model

Tables (`server/database/schema/domain.ts`): `state` / `city` / `address`
(BR locations + per-user address), `species` / `breed`, `pet` / `pet_image`,
`vaccine` / `applied_vaccine`, `adoption_application`, `staff_profile` /
`staff_invitation`. Enums (`enums.ts`): `user_role`, `pet_sex`, `pet_size`,
`pet_status`, `application_status`, `invitation_role`, plus `home` and
`enclosure_type` (used on adoption applications).

## Code patterns

- **API route = thin controller:** guard → validate → delegate → return.
  ```ts
  export default defineEventHandler(async (event) => {
    const session = await requireStaff(event)               // authz (session.ts)
    const id = useUuidParam(event, 'id')                    // param (validation.ts)
    const input = await useValidatedBody(event, someSchema) // body (validation.ts)
    return useSomeService().doThing(id, input, session.user.id)
  })
  ```
  Route file naming follows Nitro convention: `index.get.ts`, `[id].patch.ts`,
  `[id]/review.post.ts`.
- **Validation helpers** (`server/utils/validation.ts`): `useValidatedBody` and
  `useValidatedQuery` (throw 422 with field errors), `useUuidParam` (400).
- **Authz helpers** (`server/utils/session.ts`): `requireUser` (401),
  `requireStaff` (admin + staff, 403), `requireAdmin` (admin only, 403),
  `requireCronOrAdmin` (bearer `CRON_SECRET` or admin session). `/api/admin/**`
  always calls `requireStaff`/`requireAdmin` — never trust client middleware alone.
- **Services** take repository/port interfaces via the constructor and throw
  `createError` for HTTP errors. Wired only in `server/utils/services.ts` via
  `useXService()`.
- **Repositories** are the only DB-touching layer; each exposes an interface the
  service depends on. Multi-step writes use `db.transaction`.
- `useDb()` returns a lazy, process-wide Drizzle client (reused across requests).

## Auth flow

**Roles:** `admin`, `staff`, `adopter` (stored on `user.role`, default `adopter`).
BetterAuth is mounted at `/api/auth/**` (`server/api/auth/[...all].ts`); config in
`server/utils/auth.ts`. Google activates automatically once its client ID + secret
are set.

```
Adopter self-registration
  Browser: authClient.signUp.email()  ──►  /api/auth/**  ──►  user created, role=adopter (autoSignIn)

Staff invitation (admin-issued)
  1. Admin → Staff → invite(email, role)
     POST /api/admin/invitations  ──►  StaffService.invite()
       → create staff_invitation (token, 7-day expiry)
       → EmailSender.send(link = {authBaseUrl}/register?invite=<token>)   [logged to console in dev]
  2. Invitee opens /register?invite=<token>  (register.vue detects the token)
     POST /api/invitations/accept  ──►  StaffService.acceptInvitation()
       → validate token (not expired/used)
       → IdentityProvider.createUser()  (BetterAuth signUpEmail)
       → setRole(invited role)  +  create staff_profile  +  mark invitation accepted
  3. Invitee signs in at /login  →  redirected to /admin

Password reset (BetterAuth built-in)
  1. /forgot-password  →  authClient.requestPasswordReset({ email, redirectTo: '/reset-password' })
       → always a generic response (no account enumeration)
       → sendResetPassword() in auth.ts  →  EmailSender.send(url = {authBaseUrl}/reset-password?token=…)
       → token hashed in the `verification` table, single-use, 1-hour expiry
  2. /reset-password?token=…  →  authClient.resetPassword({ newPassword, token })  →  /login

Session use (every request)
  Plugin app/plugins/auth.ts → useAuthStore.fetchSession() → GET /api/auth/get-session
  API routes re-check role server-side via requireUser / requireStaff / requireAdmin
```

Plain `/register` (no `?invite`) always yields an `adopter`; adopters can never
reach the admin panel. The BetterAuth admin plugin's privileged ops are limited to
`admin` (`adminRoles: ['admin']`); domain admin-panel access (staff + admin) is
enforced by `requireStaff`.

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

## Ports & adapters

**Email** (`server/email/email-sender.ts`): `EMAIL_PROVIDER` selects the adapter —
`console` (`ConsoleEmailSender`, logs to stdout — the default), `smtp`
(`SmtpEmailSender`, Nodemailer; Gmail needs an App Password), or `resend`
(`ResendEmailSender`). The chosen adapter is wrapped in `DeferredEmailSender`,
which returns before delivery completes so the request isn't blocked: on Vercel
`waitUntil` keeps the function alive until the send finishes; elsewhere it's
fire-and-forget. A send failure is logged, not surfaced to the caller. Selected in
`createEmailSender()`, wired in both `services.ts` and `auth.ts`.

**Image uploads** (`server/storage/blob-storage.ts`): when a Vercel Blob
read/write token is set, `services.ts` wires `VercelBlobStorage`; otherwise
`DisabledBlobStorage` (upload endpoints return 501). Uploads are client-direct —
the browser sends bytes straight to Vercel Blob after the token endpoints
(`/api/admin/uploads/pet-image`, `/api/me/avatar-upload`) authorize and scope a
token. The daily `blob-sweep` cron deletes orphaned blobs. Create a separate Blob
store for local dev so uploads stay out of production data.

## Local setup & Docker

See the [README](../README.md) for first-time setup and how to obtain optional
keys. Quick reference:

```bash
docker compose up -d db          # local Postgres on :5432
pnpm install
pnpm db:migrate
pnpm db:seed                     # first admin + reference species (idempotent)
pnpm db:seed:locations           # BR states + cities (optional, from IBGE API)
pnpm dev                         # http://localhost:3000
```

Seeded admin (overridable): `admin@aumigo.local` / `ChangeMe123!`.

**Everything in Docker:** `docker compose up --build` runs the DB plus the Nuxt
dev server (Dockerfile `dev` target) on :3000 with the repo bind-mounted, so host
edits hot-reload. The app container does **not** run migrations or seeds — run
them yourself:

```bash
docker compose exec -T app pnpm db:migrate
docker compose exec -T app pnpm db:seed
```

`node_modules` and `.nuxt` live in anonymous volumes (not bind-mounted), so after
changing dependencies you must install **inside** the container and restart:

```bash
docker compose exec -T app pnpm install
docker compose restart app
```

## Configuration

Server configuration is read in `nuxt.config.ts` (`runtimeConfig`). For the full
list of variables and their defaults see `.env.example`. The important behavior:

- **Postgres** is required (Docker locally, Neon pooled connection in prod).
- **Email** defaults to `console` (no account needed); SMTP/Resend are optional.
- **Image uploads** are disabled until a Vercel Blob token is provided.
- **Google login** is off until a Google OAuth client ID + secret are provided.
