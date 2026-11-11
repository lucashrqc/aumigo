# Plan: Orphaned-blob sweep endpoint + admin reports page

> Status: **ready to implement** (design approved). This document is the full
> spec. It is structured as independent **work packages (WPs)** with single-file
> ownership so multiple sub-agents can implement in parallel against the shared
> contracts in §4. Read §1–§4 first, then your assigned WP in §6.

---

## 1. Context & goal

Pet-image uploads now happen on **Save** (cropped files are held locally, then
uploaded to Vercel Blob when the pet form is submitted). Combined with avatar
replacement, this leaves **orphaned blobs** — files in storage that no DB row
references (user abandons the form, removes a photo, or replaces an avatar).

Goal: a **sweep** that lists Blob storage, diffs it against referenced URLs, and
deletes orphans older than a grace period — wired for **Vercel Cron**, plus an
**admin page** to inspect and manually trigger it.

This eliminates *abandonment* orphans. It does **not** fully close *failure*
orphans (uploads succeed but the pet request then fails) — those are reclaimed by
the same sweep on a later run.

## 2. Decisions (approved)

| Decision | Choice |
|---|---|
| Delete behavior | **Dry-run by default**; deletes only with `?delete=true` |
| Auth | **Cron secret OR admin session** (`Authorization: Bearer $CRON_SECRET`) |
| Grace period | **24h** default, overridable via `?minAgeHours=` |
| Prefixes swept | **both** `pets/` and `avatars/` |
| Reports storage | **On-demand** (no persistence — Vercel FS is ephemeral; no history table) |
| Admin page | Report view **+ "Delete now"** button (admin-gated, confirm dialog) |
| Architecture | Extend **BlobStorage port** + **service layer** (swappable-adapters rule) |

## 3. Facts established during exploration (do not re-investigate)

- **Referenced URL columns** (the only two blob references in the DB):
  - `pet_image.url` — `server/database/schema/domain.ts:157` (NOT NULL) → prefix `pets/`
  - `user.image` — `server/database/schema/auth.ts:17` (nullable; may hold **external
    OAuth** URLs that are not Vercel blobs — safe, they won't appear in `list()`) → prefix `avatars/`
- Both columns store the **full absolute `result.url`**, so diff against each blob's `.url` (not `pathname`).
- Upload token guard sets `addRandomSuffix: true`, so pathnames are
  `pets/<ts>-<name>-<suffix>.<ext>` / `avatars/...`. No other prefixes exist anywhere.
- Blob port today: `server/storage/blob-storage.ts` — only `handleClientUpload`; **no**
  server-side `list`/`del` yet (this is the first use of the `@vercel/blob` admin API).
- Composition root: `server/utils/services.ts` — `buildContainer()` builds repos+services,
  memoizes a `Container`, exposes `useXService()`; blob adapter chosen by `config.blobReadWriteToken`.
- Guards: `server/utils/session.ts` — `requireUser/requireStaff/requireAdmin` throw 401/403 via `createError`.
- `runtimeConfig` server secrets: `nuxt.config.ts:68-93` (pattern: `key: process.env.X || ''`).
- Validation helpers: `server/utils/validation.ts` — `useValidatedQuery(event, zodSchema)` throws 422.
- No `server/routes/**`, no `vercel.json`, **no cron/header-auth precedent** — this establishes them.
- Admin page middleware exists: `app/middleware/admin.ts` (also `staff.ts`, `auth.ts`).
- Client data-fetching: TanStack Query + `useRequestFetch()` (see `app/composables/usePets.ts`).
- Destructive UI action pattern: `useDialog()` + `ConfirmDialog` (see `app/pages/(private)/admin/pets/[id].vue:73-90`).
- Sidebar nav: `app/components/AppSidebar.vue` `data.navMain` array; rendered by
  `app/components/NavMain.vue`. `adminOnly` is **declared but NOT enforced** today
  (NavMain ignores it) — we will enforce it.
- Response DTOs live in `shared/types`; auto-imported (e.g. `PetDto` used without import).
- Tests: `docs/testing.md` — unit (`test/unit/**`, mocked repos, `createError` polyfilled in
  `test/setup/globals.ts`), integration endpoints (`test/integration/helpers/endpoint.ts` boots the
  real Nitro route over `node:http`, fakes auto-import globals + session via `x-test-user-id`).

## 4. Shared contracts — IMPLEMENT EXACTLY (all WPs depend on these)

### 4.1 Response DTO (owned by WP-TYPES)
Place in `shared/types` following the existing pattern (new file `shared/types/maintenance.ts`,
exported from the barrel if one exists; confirm how `PetDto` is declared and mirror it).

```ts
export interface BlobSweepOrphan {
  url: string
  pathname: string
  prefix: string        // 'pets/' | 'avatars/'
  size: number          // bytes
  uploadedAt: string    // ISO-8601
  ageHours: number      // whole or fractional hours since uploadedAt
  eligible: boolean      // ageHours >= minAgeHours (i.e. past the grace period)
}

export interface BlobSweepReportDto {
  dryRun: boolean
  minAgeHours: number
  scanned: number        // total blobs listed across all prefixes
  referenced: number     // count of referenced URLs in the DB
  orphaned: number       // blobs not referenced (any age)
  eligible: number       // orphans past the grace period
  deleted: number        // actually deleted this run (0 when dryRun)
  capped: boolean        // true if eligible exceeded MAX_SWEEP_DELETIONS
  orphans: BlobSweepOrphan[]  // all orphans (eligible flag distinguishes)
}
```

### 4.2 BlobStorage port additions (owned by WP-PORT)
Extend the interface in `server/storage/blob-storage.ts`:

```ts
export interface BlobObject {
  url: string
  pathname: string
  size: number
  uploadedAt: Date
}

export interface BlobStorage {
  handleClientUpload(input: ClientUploadRequest): Promise<ClientUploadResult> // unchanged
  list(prefix: string): Promise<BlobObject[]>   // returns ALL blobs under prefix (paginated internally)
  delete(urls: string[]): Promise<void>         // no-op on empty array
}
```

### 4.3 MaintenanceService (owned by WP-SERVICE)
`server/services/maintenance.service.ts`:

```ts
export const MAX_SWEEP_DELETIONS = 200
const SWEEP_PREFIXES = ['pets/', 'avatars/'] as const

export interface SweepOptions { minAgeHours: number; deleteOrphans: boolean }

export class MaintenanceService {
  constructor(
    private readonly blob: BlobStorage,
    private readonly repo: MaintenanceRepository,
  ) {}
  sweepBlobs(options: SweepOptions): Promise<BlobSweepReportDto>
}
```

### 4.4 MaintenanceRepository (owned by WP-DATA)
`server/repositories/maintenance.repository.ts`:

```ts
export interface MaintenanceRepository {
  listReferencedImageUrls(): Promise<string[]>   // pet_image.url ∪ user.image (non-null)
}
export class DrizzleMaintenanceRepository implements MaintenanceRepository { /* ... */ }
```

### 4.5 Guard (owned by WP-WIRING)
Add to `server/utils/session.ts`:

```ts
// Allows Vercel Cron (Bearer $CRON_SECRET) OR an admin session.
export async function requireCronOrAdmin(event: H3Event): Promise<void>
```

### 4.6 Endpoint (owned by WP-ENDPOINT)
- **Route file:** `server/api/maintenance/blob-sweep.get.ts`
- **URL:** `GET /api/maintenance/blob-sweep`
- **Query:** `?delete=true|false` (default false), `?minAgeHours=<int>` (default 24)
- **Returns:** `BlobSweepReportDto`
- **Service accessor:** `useMaintenanceService()` (added by WP-WIRING)

### 4.7 Client composable (owned by WP-FRONTEND)
`app/composables/useBlobSweep.ts`:
```ts
export function useBlobSweepQuery(): UseQueryReturnType<BlobSweepReportDto, Error>
export function useDeleteOrphans(): UseMutationReturnType<BlobSweepReportDto, Error, number | undefined, unknown>
```
- Page route: `/admin/sweep-blobs` (file `app/pages/(private)/admin/sweep-blobs.vue`)
- Query key: `['blob-sweep']`

### 4.8 Config / env (owned by WP-WIRING + WP-CRON)
- `runtimeConfig.cronSecret = process.env.CRON_SECRET || ''`
- `vercel.json` cron path: `/api/maintenance/blob-sweep?delete=true`, schedule `0 3 * * *`
- Deploy: set `CRON_SECRET` in Vercel env (Vercel auto-sends it as the cron Bearer).

## 5. File map

**New files**
- `shared/types/maintenance.ts` (WP-TYPES)
- `server/repositories/maintenance.repository.ts` (WP-DATA)
- `server/services/maintenance.service.ts` (WP-SERVICE)
- `server/api/maintenance/blob-sweep.get.ts` (WP-ENDPOINT)
- `vercel.json` (WP-CRON)
- `app/composables/useBlobSweep.ts` (WP-FRONTEND)
- `app/pages/(private)/admin/sweep-blobs.vue` (WP-FRONTEND)
- `test/unit/maintenance.service.spec.ts` (WP-TESTS)
- `test/integration/blob-sweep.endpoint.spec.ts` (WP-TESTS)

**Modified files (single owner each)**
- `server/storage/blob-storage.ts` (WP-PORT)
- `server/utils/services.ts`, `server/utils/session.ts`, `nuxt.config.ts` (WP-WIRING)
- `app/components/AppSidebar.vue`, `app/components/NavMain.vue` (WP-FRONTEND)

> **No two WPs touch the same file.** This is what makes parallel execution safe.

## 6. Work packages

### WP-TYPES — Response DTO  *(no deps)*
**Files:** `shared/types/maintenance.ts` (+ barrel export if present).
**Do:** Add the two interfaces from §4.1 exactly. Mirror how existing DTOs in
`shared/types` are declared/exported so they auto-import.
**Accept:** `BlobSweepReportDto` importable/usable without an explicit import in both
server and `.vue` files (like `PetDto`).

---

### WP-PORT — BlobStorage list/delete  *(no deps; contract §4.2)*
**File:** `server/storage/blob-storage.ts`.
**Do:**
1. Add `BlobObject` + the two interface methods (§4.2).
2. `VercelBlobStorage.list(prefix)` — use `list` from `@vercel/blob` (NOT `/client`),
   paginate until done, map to `BlobObject`:
   ```ts
   import { list, del } from '@vercel/blob'
   async list(prefix: string): Promise<BlobObject[]> {
     const out: BlobObject[] = []
     let cursor: string | undefined
     do {
       const res = await list({ token: this.token, prefix, cursor, limit: 1000 })
       for (const b of res.blobs)
         out.push({ url: b.url, pathname: b.pathname, size: b.size, uploadedAt: b.uploadedAt })
       cursor = res.hasMore ? res.cursor : undefined
     } while (cursor)
     return out
   }
   async delete(urls: string[]): Promise<void> {
     if (!urls.length) return
     await del(urls, { token: this.token })
   }
   ```
3. `DisabledBlobStorage.list`/`delete` — throw 501 (match existing `handleClientUpload`:
   `createError({ statusCode: 501, statusMessage: 'Upload de arquivos não está configurado' })`).
**Accept:** `pnpm typecheck` passes for this file; `del`/`list` imported from `@vercel/blob`.
Verify the installed `@vercel/blob` version exposes `list({ cursor, hasMore })` + `del` and
that `blobs[].uploadedAt` is a `Date` (adjust mapping if it's a string).

---

### WP-DATA — Maintenance repository  *(no deps; contract §4.4)*
**File:** `server/repositories/maintenance.repository.ts`.
**Do:** Implement `DrizzleMaintenanceRepository` taking the Drizzle `db` (match the
constructor style of other repos, e.g. `DrizzlePetRepository`). `listReferencedImageUrls`:
```ts
const pets = await this.db.select({ url: petImage.url }).from(petImage)
const avatars = await this.db
  .select({ url: user.image }).from(user).where(isNotNull(user.image))
return [...pets.map(r => r.url), ...avatars.map(r => r.url!).filter(Boolean)]
```
Import `petImage`, `user` from the schema barrel (`server/database/schema`), `isNotNull` from `drizzle-orm`.
**Accept:** Returns a flat `string[]` of all referenced URLs; no nulls. Unit-test-friendly
(pure DB read, no side effects).

---

### WP-SERVICE — Maintenance service  *(depends on contracts §4.1/4.2/4.4; compiles after WP-TYPES/PORT/DATA land)*
**File:** `server/services/maintenance.service.ts`.
**Do:** Implement `sweepBlobs` (§4.3):
```ts
async sweepBlobs({ minAgeHours, deleteOrphans }: SweepOptions): Promise<BlobSweepReportDto> {
  const referenced = new Set(await this.repo.listReferencedImageUrls())
  const now = Date.now()
  let scanned = 0
  const orphans: BlobSweepOrphan[] = []
  for (const prefix of SWEEP_PREFIXES) {
    const blobs = await this.blob.list(prefix)
    scanned += blobs.length
    for (const b of blobs) {
      if (referenced.has(b.url)) continue
      const ageHours = (now - b.uploadedAt.getTime()) / 3_600_000
      orphans.push({
        url: b.url, pathname: b.pathname, prefix, size: b.size,
        uploadedAt: b.uploadedAt.toISOString(),
        ageHours: Math.floor(ageHours),
        eligible: ageHours >= minAgeHours,
      })
    }
  }
  const eligibleUrls = orphans.filter(o => o.eligible).map(o => o.url)
  const capped = eligibleUrls.length > MAX_SWEEP_DELETIONS
  const toDelete = eligibleUrls.slice(0, MAX_SWEEP_DELETIONS)
  if (deleteOrphans && toDelete.length) await this.blob.delete(toDelete)
  return {
    dryRun: !deleteOrphans, minAgeHours,
    scanned, referenced: referenced.size,
    orphaned: orphans.length, eligible: eligibleUrls.length,
    deleted: deleteOrphans ? toDelete.length : 0, capped, orphans,
  }
}
```
**Accept:** Pure/deterministic given mocked `blob` + `repo`; no direct `@vercel/blob` import
(goes through the port). Keep the diff logic in this method (unit-tested by WP-TESTS).

---

### WP-WIRING — Composition root + guard + config  *(owns 3 existing files)*
**Files:** `server/utils/services.ts`, `server/utils/session.ts`, `nuxt.config.ts`.
**Do:**
1. `nuxt.config.ts` — add to `runtimeConfig`: `cronSecret: process.env.CRON_SECRET || ''` (near `blobReadWriteToken`).
2. `server/utils/session.ts` — add `requireCronOrAdmin` with a constant-time compare:
   ```ts
   import { timingSafeEqual } from 'node:crypto'
   function safeEqual(a: string, b: string) {
     const ab = Buffer.from(a), bb = Buffer.from(b)
     return ab.length === bb.length && timingSafeEqual(ab, bb)
   }
   export async function requireCronOrAdmin(event: H3Event): Promise<void> {
     const header = getHeader(event, 'authorization') ?? ''
     const secret = useRuntimeConfig(event).cronSecret
     if (secret && safeEqual(header, `Bearer ${secret}`)) return
     await requireAdmin(event)
   }
   ```
3. `server/utils/services.ts` — construct `new DrizzleMaintenanceRepository(db)` and
   `new MaintenanceService(blobStorage, maintenanceRepo)`; add `maintenanceService` to the
   `Container` interface + returned object; export `export const useMaintenanceService = () => container().maintenanceService`.
**Accept:** `useMaintenanceService()` resolves; guard returns void for a valid Bearer and
delegates to `requireAdmin` otherwise. `useRuntimeConfig(event).cronSecret` typed.

---

### WP-ENDPOINT — Route + query schema  *(depends on §4.5/4.6; compiles after WP-WIRING/SERVICE)*
**File:** `server/api/maintenance/blob-sweep.get.ts`.
**Do:**
```ts
import { z } from 'zod'
// GOTCHA: z.coerce.boolean() makes "false" truthy — parse the string explicitly.
const querySchema = z.object({
  delete: z.enum(['true', 'false']).optional().transform(v => v === 'true'),
  minAgeHours: z.coerce.number().int().min(0).max(24 * 365).optional(),
})
export default defineEventHandler(async (event) => {
  await requireCronOrAdmin(event)
  const { delete: del, minAgeHours } = useValidatedQuery(event, querySchema)
  const report = await useMaintenanceService().sweepBlobs({
    minAgeHours: minAgeHours ?? 24,
    deleteOrphans: del ?? false,
  })
  console.log(
    `[blob-sweep] scanned=${report.scanned} orphaned=${report.orphaned} ` +
    `eligible=${report.eligible} deleted=${report.deleted} dryRun=${report.dryRun}`,
  )
  return report
})
```
**Note:** GET with a `?delete=true` side-effect is intentional — Vercel Cron only issues
GETs. It is safe-by-default and gated by the secret/admin guard.
**Accept:** `curl` without creds → 401/403; with `Bearer $CRON_SECRET` → 200 JSON `BlobSweepReportDto`;
`?delete=false` does not delete; `?minAgeHours=0` makes all orphans eligible.

---

### WP-CRON — vercel.json  *(no deps)*
**File:** `vercel.json` (repo root).
```json
{
  "crons": [
    { "path": "/api/maintenance/blob-sweep?delete=true", "schedule": "0 3 * * *" }
  ]
}
```
**Accept:** Valid JSON; path matches the endpoint. Add a one-line note in the PR/commit that
`CRON_SECRET` must be set in Vercel env for the Bearer guard to accept cron calls.

---

### WP-FRONTEND — Composable + page + sidebar  *(depends on §4.1/4.7; runtime-depends on WP-ENDPOINT)*
**Files:** `app/composables/useBlobSweep.ts`, `app/pages/(private)/admin/sweep-blobs.vue`,
`app/components/AppSidebar.vue`, `app/components/NavMain.vue`.
**Do:**
1. **Composable** (mirror `usePets.ts`):
   ```ts
   export function useBlobSweepQuery() {
     const api = useRequestFetch()
     return useQuery({
       queryKey: ['blob-sweep'],
       queryFn: () => api<BlobSweepReportDto>('/api/maintenance/blob-sweep'),
     })
   }
   export function useDeleteOrphans() {
     const api = useRequestFetch(); const qc = useQueryClient()
     return useMutation({
       mutationFn: (minAgeHours?: number) =>
         api<BlobSweepReportDto>('/api/maintenance/blob-sweep', {
           query: { delete: 'true', ...(minAgeHours != null ? { minAgeHours } : {}) },
         }),
       onSuccess: () => qc.invalidateQueries({ queryKey: ['blob-sweep'] }),
     })
   }
   ```
2. **Page** `app/pages/(private)/admin/sweep-blobs.vue`:
   - `definePageMeta({ layout: 'private', middleware: 'admin' })`; `useHead({ title: 'Limpeza de imagens — Admin' })`.
   - Use `useBlobSweepQuery()` for the report; stat cards for `scanned / referenced /
     orphaned / eligible`; a `Table` of `report.orphans` (thumbnail `<img :src="o.url">`,
     `pathname`, `prefix` badge, formatted `size`, `ageHours`, an "Elegível/Em carência" badge).
   - **"Excluir órfãos agora"** button: disabled when `eligible === 0`; opens `ConfirmDialog`
     via `useDialog()` (destructive; copy the pattern from `pets/[id].vue:73-90`); on confirm
     calls `useDeleteOrphans().mutateAsync()`, then `toast.success`. Show a dry-run notice
     ("Nada é excluído até você confirmar").
   - Loading / empty ("Nenhum órfão encontrado") / error states.
3. **Sidebar** `AppSidebar.vue`: add to `data.navMain` an item
   `{ title: 'Limpeza de imagens', url: '/admin/sweep-blobs', icon: ImageOff, iconClass: 'text-rose-400', adminOnly: true }`
   (import an icon from `@lucide/vue`, e.g. `ImageOff` or `Trash2`). Then **enforce `adminOnly`**:
   in the `filteredNavMain` computed, drop items with `adminOnly` unless
   `useAuthStore().user?.role === 'admin'` (this also fixes the currently-unenforced "Staff" item).
4. **NavMain.vue**: extend the `NavItem` interface with `adminOnly?: boolean` so the type is
   explicit (behavior unchanged; filtering stays in AppSidebar).
**Accept:** As admin, the sidebar shows the item and `/admin/sweep-blobs` renders the live
dry-run report with **no** delete call on load (Network shows only the GET report). Non-admins
don't see the item. "Delete now" triggers confirm → delete → list refreshes.

---

### WP-TESTS — Unit + integration  *(runtime-depends on WP-SERVICE/ENDPOINT; write against contracts in parallel)*
**Files:** `test/unit/maintenance.service.spec.ts`, `test/integration/blob-sweep.endpoint.spec.ts`.
**Do:**
- **Unit** (mirror existing service unit tests; `createError` is polyfilled in `test/setup/globals.ts`):
  construct `new MaintenanceService(blobMock, repoMock)` with `vi.fn()` mocks.
  - `blobMock.list` returns a fixed set across both prefixes; `repoMock.listReferencedImageUrls`
    returns a subset. Assert: referenced URLs excluded from `orphans`; `ageHours`/`eligible`
    computed from `uploadedAt` vs `minAgeHours` (use fake timers or fixed dates); **dry-run**
    (`deleteOrphans:false`) → `blobMock.delete` NOT called and `deleted===0`; **delete**
    (`deleteOrphans:true`) → `delete` called with exactly the eligible URLs; `capped` true and
    only `MAX_SWEEP_DELETIONS` deleted when eligible exceeds the cap.
  - Assert `DisabledBlobStorage.list()`/`delete()` reject with `statusCode: 501` (extend the
    existing `test/unit/blob-storage.spec.ts` if present, or add cases here).
- **Integration** (copy `test/integration/helpers/endpoint.ts`): boot
  `server/api/maintenance/blob-sweep.get`. The helper fakes auto-import globals — add stubs for
  `getHeader`, `useRuntimeConfig` (return `{ cronSecret: 'test-secret' }`), and a
  `useMaintenanceService` returning a stub whose `sweepBlobs` returns a canned report.
  Assert: no `Authorization` and no admin session → **401/403**; `Authorization: Bearer test-secret`
  → **200** with the report body; `?delete=false`/absent → stub called with `deleteOrphans:false`.
**Accept:** `pnpm test` green for both new files.

## 7. Execution strategy for parallel sub-agents

**Phase A — parallel (independent files, implement against §4 contracts):**
Run these together, each owning only its files:
`WP-TYPES`, `WP-PORT`, `WP-DATA`, `WP-SERVICE`, `WP-WIRING`, `WP-ENDPOINT`, `WP-CRON`,
`WP-FRONTEND`, `WP-TESTS`.
Because the contracts in §4 are fixed and no two WPs share a file, they will not conflict.
(Compile-time deps: SERVICE/ENDPOINT/TESTS reference types+accessors from other WPs; that's
fine — they implement to the contract and resolve at the integration step.)

**Phase B — integration (single agent, sequential):**
1. `pnpm typecheck` — resolve any contract drift (import names, `uploadedAt` Date vs string from
   `@vercel/blob`, DTO field names). Pre-existing unrelated error at `usePets.ts:83` is expected.
2. `pnpm lint` (Prettier: no semicolons, single quotes, width 80) + `npx prettier --write` on new/edited files.
3. `pnpm test` — fix any failing unit/integration tests.
4. Manual smoke per §8.

## 8. Verification (end-to-end)

1. `pnpm typecheck` clean (except the known `usePets.ts:83`), `pnpm lint` 0 errors, `pnpm test` green.
2. `pnpm dev`, logged in as **admin** → open `/admin/sweep-blobs`: report renders; **no** deletion
   on load (Network: single GET, `dryRun:true`).
3. Upload a pet photo and **abandon** the form → it shows as an orphan with `eligible:false`
   (age < 24h). Call `GET /api/maintenance/blob-sweep?minAgeHours=0&delete=true` (as admin) → the
   orphan is deleted and the list refreshes. Confirm a **referenced** pet/avatar URL is never listed.
4. Auth: `curl /api/maintenance/blob-sweep` (no creds) → 401/403; with
   `-H "Authorization: Bearer <CRON_SECRET>"` → 200.
5. Non-admin staff: sidebar item hidden; hitting the page/endpoint → 403.

## 9. Deployment notes
- Set **`CRON_SECRET`** in the Vercel project env (Production + Preview). Vercel automatically
  attaches `Authorization: Bearer $CRON_SECRET` to cron invocations.
- `vercel.json` cron runs only on Production deployments. Schedule `0 3 * * *` = 03:00 UTC daily.
- `BLOB_READ_WRITE_TOKEN` must be present (already used for uploads) or the sweep returns 501.

## 10. Out of scope (future)
- Run-history/audit table (`blob_sweep_run`) + a history tab on the page.
- Per-event immediate cleanup (delete-on-remove in `PetForm`, delete-on-request-failure).
- A Vercel Blob lifecycle rule as a storage-level backstop.
