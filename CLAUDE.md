# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Aumigo is a Nuxt 4 fullstack pet-adoption platform (Vue 3 + Nitro server + Postgres/Drizzle).

## Read before working

Use these as context for any change, improvement, or question — read the ones relevant to the task:

- [docs/architecture.md](docs/architecture.md) — big picture, layers, ports, domain model, request lifecycle.
- [docs/diagrams.md](docs/diagrams.md) — rendered diagrams: ER data model, layered architecture, request data flow, endpoint map.
- [docs/backend.md](docs/backend.md) — server stack, layout, code patterns, **auth flow**, DB & Docker commands, local setup.
- [docs/frontend.md](docs/frontend.md) — Nuxt/Vue stack, folder layout, data-fetching & route-guard patterns.
- [docs/testing.md](docs/testing.md) — unit/integration/E2E suites and how to run a single test.

The full original design is in [docs/plans/aumigo-plan.md](docs/plans/aumigo-plan.md).

## Essential commands

```bash
pnpm dev                         # dev server (http://localhost:3000)
pnpm lint        / lint:fix      # ESLint
pnpm typecheck                   # nuxt typecheck (vue-tsc)
pnpm test                        # unit + integration
pnpm build                       # production build

docker compose up -d db          # local Postgres on :5432
pnpm db:migrate / db:seed        # apply migrations / seed first admin + species
pnpm db:generate                 # generate a migration after editing schema
```

First-time local setup and the full command set are in [docs/backend.md](docs/backend.md).

## Conventions that cross files

- **Validation is shared:** Zod schemas in `shared/schemas/**` (import via `#shared/schemas`)
  are the source of truth for both server and client. Response DTOs live in `shared/types`.
- **Server layering is strict:** API route (guard → validate → delegate) → service
  (business rules, interfaces only) → repository (only layer touching the DB). Wire
  dependencies only in the composition root `server/utils/services.ts`.
- **Authz is server-side:** always guard `/api/**` with `requireUser`/`requireStaff`/`requireAdmin`
  (`server/utils/session.ts`). Client route middleware is UX, not security.
- **Swappable adapters:** image/email/identity are behind ports; add/swap adapters in the
  composition root, don't call concrete libs from services.
- Code style: Prettier (no semicolons, single quotes, width 80) + ESLint. Run both before finishing.
- **Avoid code comments:** prefer clear names and structure over comments. Add a comment only
  when the code is genuinely hard to understand (non-obvious intent, tricky edge case, a
  workaround) — explain the *why*, not the *what*.
