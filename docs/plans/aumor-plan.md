# Plan: "aumor" — Nuxt Fullstack Pet Adoption Platform

> On approval, the first implementation step saves this file to
> `docs/plans/aumor-plan.md` in the repo. All code, table names, and column
> names are **English (en-US)**; the reference UML (`docs/image.png`) is in
> Portuguese and is translated below.

## Context

`aumor` is a greenfield pet-adoption platform (empty repo: only `.git` and
`docs/image.png`, the reference UML). It needs:

- A **public site** where visitors browse adoptable pets and registered
  adopters submit adoption applications.
- A **staff-only admin panel** where company employees manage pets, vaccines,
  applied-vaccine records, adoption applications, and staff invitations.

Runs on **Docker locally**, deploys to **Vercel via GitHub**, data in
**Postgres on Neon**, auth via **BetterAuth**. The code follows clean-code and
SOLID principles. This plan scaffolds the full stack plus the domain model from
the UML, with the entities and flows confirmed in the planning Q&A.

### UML translation (Portuguese → English)

| UML (pt) | Model (en) | Key fields (en) |
|---|---|---|
| Funcionario | staff_profile | name, phone, active, timestamps |
| Endereco | address | street, zip_code, neighborhood, number, complement |
| Cidade | city | name, state, ibge_code |
| Pet | pet | name, description, weight, size, coat, sex, special_needs, neutered, active, birth_date |
| Vacina | vaccine | name, description, expiration_date |
| VacinaAplicada | applied_vaccine | vet_license, batch_number, application_date, next_dose_date |
| especie / raca | species / breed | name |
| cadastrado_por / atualizado_por | created_by / updated_by | → user.id |
| data_cadastro / data_atualizado | created_at / updated_at | timestamps |

### Confirmed decisions (from Q&A)
- **ORM:** Drizzle (+ drizzle-kit migrations), Neon serverless driver.
- **Auth:** email + password now; Google social login *prepared but disabled*.
- **Staff access:** admin-invites-by-email; adopters self-register and can
  never reach the admin panel. Admin panel open to **both** `staff` and `admin`
  roles.
- **Entities:** full UML (pet, vaccine, applied_vaccine, staff, address, city) +
  species/breed lookup tables + **adoption applications**.
- **Images:** URL-only in v1, behind an `ImageStorage` interface (swap to Vercel
  Blob later via one adapter).
- **Tests:** Vitest + Vue Test Utils + `@nuxt/test-utils` (unit/component),
  Playwright (E2E), Vitest + `@nuxt/test-utils` against **Dockerized Postgres**
  (backend integration).
- **CI:** GitHub Actions (lint + typecheck + tests on PRs).

### Deliberate deviations from the UML (flagged for veto)
1. **UUID (text) primary keys everywhere** instead of int, so domain FKs line up
   with BetterAuth's string `user.id`, and public pet URLs aren't enumerable.
2. **staff_profile** is a 1:1 profile on BetterAuth `user`; the UML's
   `email`/`senha` live in BetterAuth, not duplicated.
3. **species/breed lookup tables** (you selected "Pet species/breed
   categories"); `pet` references `species_id`/`breed_id`.
4. **adoption_application** added (not in UML) for the adopter→staff review flow.

---

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | Nuxt 4 (Nitro server, `app/` dir), TypeScript |
| Package manager | pnpm |
| DB / driver | Neon Postgres + `@neondatabase/serverless` (local: Docker Postgres) |
| ORM | Drizzle ORM + drizzle-kit |
| Auth | BetterAuth (`better-auth`) + Drizzle adapter + admin plugin |
| Validation | Zod (shared client/server schemas) |
| Client state | Pinia (auth/profile store) |
| Server state | TanStack Query (`@tanstack/vue-query`) |
| Tables | TanStack Table (`@tanstack/vue-table`) |
| UI | shadcn-vue + Tailwind CSS + `lucide-vue-next` |
| Lint/format | `@nuxt/eslint` + Prettier |
| Unit/component tests | Vitest + `@vue/test-utils` + `@nuxt/test-utils` |
| E2E tests | Playwright |
| Backend tests | Vitest + `@nuxt/test-utils` against Docker Postgres |
| CI | GitHub Actions |
| Deploy | Vercel (Nuxt Vercel preset) from GitHub |

---

## Data Model (Drizzle schema — all English)

BetterAuth-owned tables (generated via `@better-auth/cli generate`):
`user` (+ `role`, `banned` from admin plugin), `session`, `account`,
`verification`.

Domain tables (all `id uuid default gen_random_uuid()`, `created_at`,
`updated_at`; audit `created_by`/`updated_by` → `user.id`):

- **staff_profile**: `user_id` 1:1 → user, `name`, `phone`, `active`.
- **city**: `name`, `state`, `ibge_code`.
- **address**: `staff_id` → staff_profile, `city_id` → city, `street`,
  `zip_code`, `neighborhood`, `number`, `complement`.
- **species**: `name`.
- **breed**: `species_id` → species, `name`.
- **pet**: `name`, `species_id`, **`breed_id` (nullable — mixed/unknown breed)**,
  `description`, `weight`, `size`, `coat`, `sex`, `special_needs`, `neutered`,
  `active`, `birth_date`, `status` (`available`/`pending`/`adopted`), audit
  fields. Status stays **`available`** while applications accumulate; it flips to
  `adopted` only when staff **approve** an application. `pending` is a manual
  "on hold" state, not auto-set by applying.
- **pet_image**: `pet_id` → pet, `url`, `position` (int). Multiple photos per
  pet; still URL-only in v1 behind the `ImageStorage` port.
- **vaccine**: `name`, `description`, `expiration_date`, audit fields.
- **applied_vaccine**: `pet_id`, `vaccine_id`, `vet_license`, `batch_number`,
  `application_date`, `next_dose_date`, audit fields.
- **adoption_application**: `pet_id`, `adopter_user_id` → user,
  **`contact_phone`** (how staff reach the adopter), `status`
  (`pending`/`approved`/`rejected`), `message`, `reviewed_by` → user,
  `reviewed_at`, audit fields. **Partial unique index** on
  `(pet_id, adopter_user_id) WHERE status='pending'` prevents duplicate open
  applications.
- **staff_invitation**: `email`, `role` (`staff`/`admin`), `token`, `expires_at`,
  `accepted_at`, `invited_by` → user.

Enums (`sex`, `size`, pet `status`, application `status`, `role`) as Drizzle
`pgEnum`.

### Schema conventions (applied throughout)
- All timestamps are **`timestamptz`**.
- **Indexes** on every FK and on `pet.status` / `pet.active` (public listing),
  `adoption_application.pet_id` / `.adopter_user_id`.
- Audit `created_by` / `updated_by` are **nullable** (seeded reference data —
  species, breed, city — has no staff author).
- **Soft delete** via `active` flags; pets/staff are deactivated, never hard
  deleted, so adoption and vaccine history is preserved. FKs use `RESTRICT`.

---

## Auth & Authorization

- **BetterAuth config** (`server/utils/auth.ts`): `drizzleAdapter`,
  `emailAndPassword` enabled, `socialProviders.google` scaffolded but **commented
  / env-gated** (no client id yet), `admin()` plugin with access-control roles
  **`admin`, `staff`, `adopter`** (default new signups → `adopter`).
- **Client** (`app/lib/auth-client.ts`): BetterAuth Vue client (`useSession`,
  `signIn`, `signUp`, `signOut`).
- **Invite flow (custom, on top of admin plugin):**
  1. Admin/staff POST `/api/admin/invitations` → creates `staff_invitation`
     (token, expiry). v1 returns/logs the invite link (email send stubbed behind
     an `EmailSender` interface; Resend adapter added later).
  2. Employee opens `/register?invite=<token>` → signs up → server consumes the
     invite, sets `user.role` = invited role, creates `staff_profile`.
  3. Plain `/register` (no token) → `adopter` role, no staff profile.
- **Route guards:**
  - `app/middleware/staff.ts` (applied to `(private)` layout/pages): allow
    `role ∈ {admin, staff}`, else redirect to `/login` or `/`.
  - Server-side: `server/utils/require-staff.ts` guard used by every
    `/api/admin/**` handler (never trust the client).

---

## Project Structure

```
app/
  pages/
    (public)/                 # public route group (no URL segment)
      index.vue               # landing
      pets/index.vue          # browse
      pets/[id].vue           # detail + "adopt" (if logged in)
      login.vue  register.vue
      applications/index.vue  # adopter's own applications
    (private)/                # staff route group, guarded
      admin/index.vue         # dashboard
      admin/pets/...          # list (TanStack Table) + create/edit
      admin/vaccines/...
      admin/applied-vaccines/...
      admin/applications/...  # review/approve/reject
      admin/staff/...         # invitations + user management
  layouts/ public.vue  private.vue
  components/ui/...           # shadcn-vue generated
  components/...              # feature components
  composables/               # useX TanStack Query hooks
  stores/auth.ts             # Pinia: session + role + staff profile
  middleware/staff.ts
  plugins/vue-query.ts
  lib/ auth-client.ts  utils.ts (shadcn cn)
server/
  api/
    auth/[...all].ts          # BetterAuth handler
    pets/...  admin/...        # REST handlers (controllers)
  services/                    # business logic (pet, vaccine, adoption, invite)
  repositories/                # Drizzle data access (interface + impl)
  database/
    schema/*.ts  relations.ts  index.ts
    migrations/
    seed.ts                    # first admin + reference data
  storage/ image-storage.ts    # interface + UrlImageStorage impl
  email/ email-sender.ts       # interface + Console/Resend impl
  utils/ auth.ts  db.ts  require-staff.ts
shared/
  schemas/                     # Zod schemas (shared validation + types)
  types/
docs/plans/aumor-plan.md       # this plan, saved on approval
```

---

## Backend Architecture (SOLID)

Layered with dependency inversion:

- **Route handler (controller)** — parse/validate input (Zod), call a service,
  map result to HTTP. Thin.
- **Service** — business rules (e.g. approving an application flips pet→adopted
  and rejects competing applications). Depends on **repository interfaces**, not
  Drizzle directly.
- **Repository** — one interface + one Drizzle implementation per aggregate
  (`PetRepository`, `VaccineRepository`, …). Only layer that touches the DB.
- **Ports** — `ImageStorage` and `EmailSender` interfaces with swappable
  adapters (URL/Console now; Blob/Resend later) → Open/Closed + Liskov.
- Composition in `server/utils` factories; `db.ts` exposes the Drizzle client
  (Neon serverless in prod, `pg`/node driver locally).

Audit fields (`created_by`/`updated_by`) set in services from the authenticated
session.

---

## Frontend Architecture

- **Pinia `auth` store** — wraps BetterAuth session as the single app-wide
  source for `user`, `role`, `isStaff`, and the loaded staff profile. (BetterAuth
  provides the session; Pinia centralizes derived auth state + profile, per your
  request.)
- **TanStack Query** — all server reads/writes via composables
  (`usePets`, `useAdoptionApplications`, mutations with cache invalidation).
  Registered through `plugins/vue-query.ts` with SSR-safe hydration.
- **TanStack Table** — admin list views (pets, vaccines, applications, staff),
  column defs + sorting/pagination/filtering.
- **shadcn-vue** — `npx shadcn-vue init`, Tailwind, generate needed components
  (button, input, table, dialog, form, badge, dropdown…). Dark mode via
  `@nuxtjs/color-mode`.
- **Routing** — `(public)`/`(private)` route groups; `(private)` uses
  `private.vue` layout + `staff` middleware.

---

## Local Docker, Neon & Vercel

- **`docker-compose.yml`** (local dev): `db` (postgres:16) + `app` (Nuxt dev,
  bind-mounted, `pnpm dev`). `.env` sets `DATABASE_URL` to the compose Postgres.
- **`docker-compose.test.yml`**: disposable `postgres` for integration tests.
- **`Dockerfile`**: multi-stage (deps → build → runtime) for parity; Vercel uses
  its own build (Nuxt Vercel preset auto-detected), so the Dockerfile is for
  local/CI, not Vercel.
- **Neon**: production `DATABASE_URL` (pooled connection string) set in Vercel
  env vars, plus `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, (later) Google creds.
  `.env.example` documents all.
- **Migrations**: `drizzle-kit generate` + `drizzle-kit migrate`; a
  `pnpm db:migrate` script run against Neon from CI (or manually) on release.
  Seed (`pnpm db:seed`) creates the first `admin` user from env.

---

## Testing Strategy

- **Unit (frontend)**: components/composables/stores with Vitest +
  `@vue/test-utils` + `@nuxt/test-utils` (nuxt environment where needed).
- **Unit (backend)**: services tested against **mocked repositories**
  (interfaces make this clean).
- **Integration (backend)**: repositories + `/api` handlers via
  `@nuxt/test-utils` against **Docker Postgres** (`docker-compose.test.yml`);
  global setup runs migrations + truncates between tests.
- **E2E**: Playwright for key journeys — adopter register → browse → apply;
  staff invite → register → approve application; adopter blocked from `/admin`.
- Scripts: `test:unit`, `test:integration`, `test:e2e`, `test`.

---

## CI (GitHub Actions)

`.github/workflows/ci.yml` on PRs to `main`:
1. Setup pnpm + Node 24, install.
2. `lint` (ESLint) + `typecheck` (`nuxi typecheck`).
3. `test:unit`.
4. `test:integration` with a Postgres **service container** (+ migrate).
5. `build`.
6. Separate job: Playwright `test:e2e` (install browsers, build, run).

Vercel deploys from GitHub independently (preview per PR, prod on `main`).

---

## Implementation Order

0. Save this plan to `docs/plans/aumor-plan.md`.
1. Scaffold Nuxt 4 + TS, pnpm, ESLint/Prettier, Tailwind, shadcn-vue init.
2. Docker: `Dockerfile`, `docker-compose.yml`, `docker-compose.test.yml`,
   `.env.example`.
3. Drizzle: client, schema (BetterAuth gen + domain tables, English names),
   relations, first migration, seed.
4. BetterAuth: server config (email+password, admin plugin/roles, Google
   scaffolded-off), `/api/auth/[...all]`, client, Pinia auth store.
5. Backend layers: repositories (interfaces + Drizzle), services, Zod schemas in
   `shared/`, `ImageStorage`/`EmailSender` ports, `require-staff` guard.
6. Admin `/api/admin/**` endpoints (pets, vaccines, applied-vaccines,
   applications, invitations, staff) + public `/api/pets`, `/api/applications`.
7. Frontend: TanStack Query plugin + composables; `(public)` pages (landing,
   browse, detail, auth, my-applications); `(private)` admin pages with TanStack
   Table CRUD + application review + invite flow; guards/layouts.
8. Tests: unit (services, stores, components), integration (repos/api), Playwright
   E2E.
9. CI workflow.
10. README: local Docker run, env setup, Neon + Vercel deploy steps.

---

## Verification

- `docker compose up` → app at `http://localhost:3000`, migrations applied,
  seed admin present.
- Manual: register adopter → browse → apply; log in as seeded admin → invite
  staff → register via invite link → staff manages a pet + records a vaccine →
  approves the application (pet flips to `adopted`); confirm an adopter account
  is redirected away from `/admin` (and `/api/admin/**` returns 403).
- Social-login scaffold compiles while disabled (no Google creds required).
- `pnpm test:unit`, `pnpm test:integration` (Docker Postgres),
  `pnpm test:e2e` all green.
- `pnpm lint` + `pnpm typecheck` clean; GitHub Actions passes on a PR.
- Deploy: push to GitHub → Vercel preview builds with Neon env vars; `/` and a
  gated `/admin` behave as above in the preview.
```
