# Testing

Three suites: **unit** and **integration** (Vitest), **E2E** (Playwright).
CI runs lint → typecheck → unit → integration → build, then E2E
(`.github/workflows/ci.yml`).

## Suites

| Suite | Tool | Location | Needs DB | What it covers |
|---|---|---|---|---|
| unit | Vitest (`node`) | `test/unit/**` | no | Services (mocked repos), Zod schemas, Pinia store |
| integration | Vitest (`node`, serial) | `test/integration/**` | yes (Postgres) | Repositories against real Postgres |
| e2e | Playwright | `test/e2e/**` | yes (migrated+seeded) | Smoke flows against built app |

Vitest uses two projects (`unit`, `integration`) defined in `vitest.config.ts`.

## Commands

```bash
pnpm test                 # unit + integration
pnpm test:unit            # unit only
pnpm test:integration     # integration only (needs a test DB, see below)
pnpm test:watch           # vitest watch
pnpm test:e2e             # Playwright (needs built + seeded app)

# Run a single file / test
pnpm vitest run --project unit test/unit/schemas.spec.ts
pnpm vitest run --project unit -t "creates an application"
pnpm exec playwright test test/e2e/smoke.spec.ts
```

## Integration tests (DB)

Point `TEST_DATABASE_URL` at a Postgres the suite can wipe. A dedicated throwaway
container is provided:

```bash
docker compose -f docker-compose.test.yml up -d       # test Postgres on :5433 (tmpfs, ephemeral)
TEST_DATABASE_URL=postgresql://aumigo_test:aumigo_test@localhost:5433/aumigo_test \
  pnpm test:integration
```

`test/setup/database.ts` (Vitest `globalSetup`) **drops and recreates** the
`public` + `drizzle` schemas, then applies all migrations once before the suite.
Integration files run serially (`fileParallelism: false`) since they share one
schema. Defaults to `…/aumigo_test` on :5432 if `TEST_DATABASE_URL` is unset.

## E2E tests

Playwright assumes a migrated + seeded DB, then builds and serves the production
output (`node .output/server/index.mjs`):

```bash
pnpm db:migrate && pnpm db:seed && pnpm build && pnpm test:e2e
```

`playwright.config.ts` manages the web server (port via `E2E_PORT`, default 3000)
and reuses an existing server locally.

## Patterns

- **Unit:** services get hand-mocked repository objects (`vi.fn()`); no Nuxt
  runtime. `test/setup/globals.ts` polyfills the auto-imported `createError`
  global so server code runs outside Nitro.
- **Integration:** construct repositories directly with
  `createDatabase(TEST_DATABASE_URL)`; seed rows via Drizzle inside
  `beforeAll`/`afterAll`.
- Assert on domain invariants (e.g. approving one application adopts the pet and
  rejects siblings; the partial unique index blocks duplicate open applications).
