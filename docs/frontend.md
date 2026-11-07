# Frontend

Nuxt 4 app (`app/`), Vue 3 `<script setup>` + TypeScript. SSR with client
hydration. See [architecture.md](architecture.md) for the full picture.

## Stack

- **Nuxt 4** (compatibility v4), Vue 3, TypeScript strict.
- **UI:** shadcn-vue (reka-ui primitives) in `app/components/ui/**`, Tailwind CSS v4
  (`@tailwindcss/vite`, config-less; entry `app/assets/css/tailwind.css`).
- **Icons:** lucide-vue-next. **Toasts:** vue-sonner (`<Toaster />` in `app.vue`).
- **Server state:** TanStack Query (`@tanstack/vue-query`), SSR-hydrated.
- **Tables:** TanStack Table v9 (`@tanstack/vue-table`) via `DataTable.vue`.
- **Client state:** Pinia — `useAuthStore` (the only global store).
- **Color mode:** `@nuxtjs/color-mode` (system preference, class-based).
- **Locale:** UI copy is pt-BR (some page/route names too, e.g. `pets/cadastrar`).

## Folder structure

```
app/
  pages/
    (public)/**        Public routes: index, pets, pets/[id], login, register, applications
    (private)/admin/** Admin panel: dashboard, pets, species, breeds, vaccines,
                       applications, staff, settings
  layouts/             public.vue, private.vue (admin shell: sidebar + sign-out)
  components/
    ui/**              shadcn-vue primitives (Button, Card, Dialog, Table, Select, …)
    *.vue              App components: PetCard, PetForm, DataTable, Pagination,
                       AsyncCombobox, ImageUploader, AddressForm, ProfileForm,
                       <Entity>Form, AppDialog* (dialog host)
    features.ts        TanStack Table v9 feature set + ColumnMeta augmentation
  composables/**       TanStack Query wrappers per domain (usePets, useApplications,
                       useCatalog, useVaccines, useLocations, useProfile, useAddress,
                       useInvitations); useDialog, useInfiniteOptions (UI helpers)
  middleware/          auth.ts, staff.ts, admin.ts (route guards)
  plugins/             auth.ts (hydrate session), vue-query.ts (SSR hydration),
                       cloudflare-analytics.client.ts
  stores/auth.ts       Pinia auth store
  lib/                 auth-client.ts (BetterAuth browser client), utils.ts (cn())
  utils/               errors.ts (resolveErrorMessage), format.ts (dates/values),
                       labels.ts (pt-BR enum labels), audit-columns.ts (shared table cols)
```

## Code patterns

- **Route groups:** `(public)` and `(private)` folders group routes without
  affecting URLs. Set the layout per page with
  `definePageMeta({ layout: 'public' | 'private' })`.
- **Route guards (client):** `definePageMeta({ middleware: 'staff' })` etc. Guards
  live in `app/middleware/`: `auth` (any user), `staff` (staff+admin), `admin`
  (admin only). Server `/api/admin/**` re-enforces — guards are UX, not security.
- **Data fetching:** never call `$fetch`/`api` directly in components. Add a
  composable in `app/composables/` wrapping `useQuery`/`useMutation`:
  ```ts
  export function useAdminApplicationsQuery(params = () => ({})) {
    const api = useRequestFetch()                     // forwards cookies during SSR
    return useQuery({
      queryKey: ['admin-applications', params],
      queryFn: () => api<Paginated<AdoptionApplicationDto>>('/api/admin/applications', {
        query: toValue(params),
      }),
    })
  }
  ```
  Mutations invalidate related `queryKey`s in `onSuccess`. Use `useRequestFetch()`
  (not `$fetch`) so cookies forward during SSR.
- **Auth state:** read the current user/role from `useAuthStore` (`isAuthenticated`,
  `isStaff`, `isAdmin`, `role`); BetterAuth owns the session. Sign in/out/up via
  `authClient` (`app/lib/auth-client.ts`).
- **Tables:** admin lists use `DataTable.vue` with server-side pagination
  (`Pagination.vue`). Share created/updated columns via `auditColumns()`
  (`app/utils/audit-columns.ts`); column widths via `meta.class` (`features.ts`).
- **Async selects:** `AsyncCombobox.vue` + `useInfiniteOptions` paginate/search a
  REST endpoint (`GET {endpoint}?page&pageSize&search`) — used for species,
  breeds, cities, etc.
- **Dialogs:** open components imperatively with `useDialog().open(Component, …)`,
  which returns a Promise resolved on close; `AppDialogProvider` (in a layout)
  renders the stack and dismisses on route change. Use `ConfirmDialog` for
  confirmations.
- **Types:** request types come from `#shared/schemas` (Zod-inferred); response
  DTOs (`PetDto`, …) are globally available from `shared/types`.
- **Styling:** compose class names with `cn()` from `app/lib/utils.ts`. Prefer
  existing `components/ui` primitives before adding new ones.

## Run locally

See [backend.md](backend.md#run-locally-app--db-in-docker) — the frontend is
served by the same `pnpm dev` (http://localhost:3000). The admin panel is at
`/admin`.
