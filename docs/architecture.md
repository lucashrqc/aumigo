# Architecture

Aumigo is a **Nuxt 4 fullstack app** (Vue 3 SPA + Nitro server) backed by Postgres
via Drizzle ORM. The public browses adoptable pets and submits adoption
applications; staff manage pets, vaccines, applications, and invitations from a
gated admin panel.

> 📊 Visual reference: see [diagrams.md](diagrams.md) for the ER data model,
> layered architecture, request data flow, and endpoint map.

## Server layers

The server is layered and dependency-inverted. Data flows top-down; dependencies
point inward to interfaces.

```
HTTP   server/api/**           Controller: guard → validate (Zod) → call service → return DTO
  │
Service   server/services/**   Business rules. Depends on repository + port interfaces only.
  │
Repository  server/repositories/**   Drizzle data access. The ONLY layer that touches the DB.
  │
DB   Postgres (Drizzle schema: server/database/schema/**)
```

## Ports (swappable adapters)

Services depend on interfaces, never concrete libraries. Adapters are chosen once
in the composition root.

| Port | Interface | Default adapter | Alternatives |
|---|---|---|---|
| Image storage | `ImageStorage` (`server/storage/image-storage.ts`) | `UrlImageStorage` (stores external URLs) | — |
| Blob storage | `BlobStorage` (`server/storage/blob-storage.ts`) | `DisabledBlobStorage` (uploads off) | `VercelBlobStorage` |
| Email | `EmailSender` (`server/email/email-sender.ts`) | `ConsoleEmailSender` (logs) | `SmtpEmailSender`, `ResendEmailSender` |
| Identity | `IdentityProvider` (`server/services/identity.ts`) | `BetterAuthIdentityProvider` (`server/utils/identity-provider.ts`) | — |

**Composition root:** [server/utils/services.ts](../server/utils/services.ts)
builds the dependency graph once per process and exposes memoized accessors
(`usePetService()`, `useAdoptionService()`, …). Adapter selection — which depends
on env (e.g. Vercel Blob vs. disabled, email provider) — happens only here.

## Shared contract

`shared/` is imported by both server and client through the `#shared/*` alias:

- `shared/schemas/**` — Zod schemas + inferred input types: the single source of
  truth for validation. Barrel `shared/schemas/index.ts` → import from `#shared/schemas`.
- `shared/types/**` — response DTOs (`PetDto`, `AdoptionApplicationDto`, …) shared
  across the server/client boundary, globally auto-imported in the app.

## Request lifecycle

1. Nuxt plugin `app/plugins/auth.ts` hydrates `useAuthStore` once per request (SSR + client).
2. Route middleware (`auth` / `staff` / `admin`) guards pages on the client (UX only).
3. Composables (`app/composables/**`) call `/api/**` via TanStack Query,
   SSR-hydrated through `app/plugins/vue-query.ts`.
4. API routes re-enforce authz server-side (`requireUser` / `requireStaff` /
   `requireAdmin`), validate with Zod, delegate to a service, and return a DTO.

## Domain model

Core entities (`server/database/schema/domain.ts`): `species` → `breed` → `pet`
(+ `pet_image`); `vaccine` → `applied_vaccine` (pet ↔ vaccine); `adoption_application`
(adopter ↔ pet, reviewed by staff); `staff_profile` (1:1 with auth `user`);
`state` → `city` → `address`; `staff_invitation`. Auth tables (`user`, `session`,
`account`, `verification`) live in `schema/auth.ts`.

Key invariants (enforced in DB + service):

- An adopter may hold at most **one pending** application per pet (partial unique index).
- Approving an application is transactional: it marks the application approved,
  sets the pet to `adopted`, and auto-rejects sibling pending applications for
  that pet.

## Background jobs

A Vercel cron (`vercel.json`) calls `/api/maintenance/blob-sweep` daily to delete
orphaned upload blobs (blobs with no matching DB row). The endpoint is guarded by
`requireCronOrAdmin` (a `CRON_SECRET` bearer token, or an admin session).

See [backend.md](backend.md) and [frontend.md](frontend.md) for details.
