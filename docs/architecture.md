# Architecture

Aumigo is a **Nuxt 4 fullstack app** (Vue 3 SPA + Nitro server) with a Postgres
database via Drizzle ORM. The public browses adoptable pets and submits adoption
applications; staff manage pets, vaccines, applications, and invitations from a
gated admin panel.

## Layers (server)

The server follows a layered, dependency-inverted design. Data flows top-down;
dependencies point inward to interfaces.

```
HTTP  server/api/**            Controller: auth guard → validate (Zod) → call service → return DTO
  │
Service  server/services/**    Business rules. Depends on repository + port interfaces only.
  │
Repository  server/repositories/**   Drizzle data access. The ONLY layer that touches the DB.
  │
DB  Postgres (Drizzle schema: server/database/schema/**)
```

**Ports (swappable adapters)** — services depend on interfaces, never concrete libs:

| Port | Interface | v1 adapter | Future |
|---|---|---|---|
| Image storage | `ImageStorage` (`server/storage/image-storage.ts`) | `UrlImageStorage` (URL-only) | Vercel Blob |
| Email | `EmailSender` (`server/email/email-sender.ts`) | `ConsoleEmailSender` (logs) | Resend |
| Identity | `IdentityProvider` (`server/services/identity.ts`) | `BetterAuthIdentityProvider` (`server/utils/identity-provider.ts`) | — |

**Composition root:** [server/utils/services.ts](../server/utils/services.ts)
builds the whole dependency graph once per process and exposes memoized
accessors (`usePetService()`, `useAdoptionService()`, …). Swapping an adapter
happens only here.

## Shared contract

`shared/` is imported by both server and client via the `#shared/*` alias:

- `shared/schemas/**` — Zod schemas + inferred input types (the single source of
  truth for validation). Barrel: `shared/schemas/index.ts` → import from `#shared/schemas`.
- `shared/types/index.ts` — response DTOs (`PetDto`, `AdoptionApplicationDto`, …)
  shared across the server/client boundary. These are globally auto-imported in
  the app.

## Request lifecycle

1. Nuxt plugin `app/plugins/auth.ts` hydrates `useAuthStore` once per request (SSR + client).
2. Route middleware (`auth` / `staff` / `admin`) guards pages client-side.
3. Composables (`app/composables/**`) call `/api/**` via TanStack Query, SSR-hydrated
   through `app/plugins/vue-query.ts`.
4. API routes re-enforce authz server-side (`requireUser` / `requireStaff` / `requireAdmin`),
   validate with Zod, delegate to a service, and return a DTO.

## Domain model

Core entities (`server/database/schema/domain.ts`): `species` → `breed` → `pet`
(+ `petImage`); `vaccine` → `appliedVaccine` (pet↔vaccine); `adoptionApplication`
(adopter↔pet, reviewed by staff); `staffProfile` (1:1 with auth `user`),
`address`, `city`; `staffInvitation`. Auth tables live in `schema/auth.ts`.

Key invariants (enforced in DB + service):
- An adopter may hold at most **one pending** application per pet (partial unique index).
- Approving an application is transactional: it marks the app approved, sets the
  pet to `adopted`, and auto-rejects sibling pending applications for that pet.

See [backend.md](backend.md) and [frontend.md](frontend.md) for details.
