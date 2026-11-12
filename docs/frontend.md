# Frontend

Nuxt 4 app (`app/`), Vue 3 `<script setup>` + TypeScript (strict). SSR with client
hydration. See [architecture.md](architecture.md) for the full picture.

## Stack

- **Nuxt 4** (compatibility v4), Vue 3, TypeScript strict.
- **UI:** shadcn-vue (`shadcn-nuxt`, reka-ui primitives) in `app/components/ui/**`,
  Tailwind CSS v4 (`@tailwindcss/vite`, config-less; entry
  `app/assets/css/tailwind.css`).
- **Icons:** `@lucide/vue`. **Toasts:** vue-sonner (`<Toaster />` in `app.vue`).
- **Server state:** TanStack Query (`@tanstack/vue-query`), SSR-hydrated.
- **Forms & tables:** TanStack Form (`@tanstack/vue-form`), TanStack Table v9
  (`@tanstack/vue-table`) via `DataTable.vue`.
- **Client state:** Pinia — `useAuthStore` (the only global store).
- **Charts:** ECharts (`echarts` + `vue-echarts`) via `app/components/charts/**`.
- **Motion:** GSAP + Lenis for landing-page animation (opt-out via reduced-motion).
- **Color mode:** `@nuxtjs/color-mode` (system preference, class-based).
- **Validation:** Zod (shared with the server through `#shared/schemas`).
- **Locale:** UI copy is pt-BR (some route names too, e.g. `pets/cadastrar`).

## Folder structure

```
app/
  pages/
    (public)/**        Public routes: index, login, register, forgot/reset-password,
                       pets, pets/[id], pets/[id]/apply, applications
    (private)/admin/** Admin panel: dashboard, pets (+ cadastrar, [id]), species,
                       breeds, vaccines, applications, staff, settings, sweep-blobs
  layouts/             public.vue, private.vue (admin shell: sidebar + sign-out)
  components/
    ui/**              shadcn-vue primitives (Button, Card, Dialog, Table, Select, …)
    charts/**          ECharts wrappers (BarChart, LineChart, PieChart, …)
    landing/**         Landing-page animation pieces (paw trail, cursor, footer)
    *.vue              App components: PetCard, PetForm, <Entity>Form, DataTable,
                       Pagination, AsyncCombobox, ImageUploader/ImageCropper,
                       AddressForm, ProfileForm, inputs (Cep/Phone/Document/DatePicker),
                       dialogs (Confirm, AdoptionTerms, …), sidebar/nav
    features.ts        TanStack Table v9 feature set + ColumnMeta augmentation
  composables/**       TanStack Query wrappers per domain (usePets, useApplications,
                       useCatalog, useVaccines, useLocations, useProfile, useAddress,
                       useInvitations, useAnalytics, useBlobSweep) + UI helpers
                       (useDialog, useInfiniteOptions, useImageUpload, useCep, …)
  middleware/          auth.ts, staff.ts, admin.ts (route guards)
  plugins/             auth.ts (hydrate session), vue-query.ts (SSR hydration),
                       echarts/gsap (client), cloudflare-analytics, zod-locale
  stores/auth.ts       Pinia auth store
  lib/                 auth-client.ts (BetterAuth browser client), utils.ts (cn())
  utils/               errors.ts, format.ts, labels.ts (pt-BR enum labels),
                       audit-columns.ts, date-range.ts, initials.ts
```

## Code patterns

- **Route groups:** `(public)` and `(private)` group routes without affecting URLs.
  Set the layout per page with `definePageMeta({ layout: 'public' | 'private' })`.
- **Route guards (client):** `definePageMeta({ middleware: 'staff' })` etc. Guards
  live in `app/middleware/`: `auth` (any user), `staff` (staff + admin), `admin`
  (admin only). Server `/api/admin/**` re-enforces — guards are UX, not security.
- **Data fetching:** never call `$fetch` directly in components. Add a composable
  wrapping `useQuery`/`useMutation`:
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
  Use `useRequestFetch()` (not `$fetch`) so cookies forward during SSR. Params are
  `MaybeRefOrGetter`, unwrapped with `toValue()`, and live in the `queryKey` so
  they stay reactive. Mutations invalidate related `queryKey`s in `onSuccess`.
- **Auth state:** read the current user/role from `useAuthStore` (`isAuthenticated`,
  `isStaff`, `isAdmin`, `role`); BetterAuth owns the session. Sign in/out/up via
  `authClient` (`app/lib/auth-client.ts`).
- **Tables:** admin lists use `DataTable.vue` with server-side pagination
  (`Pagination.vue`). Share created/updated columns via `auditColumns()`; column
  widths via `meta.class` (`features.ts`).
- **Async selects:** `AsyncCombobox.vue` + `useInfiniteOptions` paginate/search a
  REST endpoint (`GET {endpoint}?page&pageSize&search`) — species, breeds, cities.
- **Dialogs:** open components imperatively with `useDialog().open(Component, …)`,
  which returns a Promise resolved on close; `AppDialogProvider` (in a layout)
  renders the stack and dismisses on route change. Use `ConfirmDialog` for
  confirmations.
- **Types:** request types come from `#shared/schemas` (Zod-inferred); response
  DTOs (`PetDto`, …) are globally available from `shared/types`.
- **Styling:** compose class names with `cn()` from `app/lib/utils.ts`. Prefer
  existing `components/ui` primitives before adding new ones.

## Run locally

See the [README](../README.md) — the frontend is served by the same `pnpm dev`
(http://localhost:3000). The admin panel is at `/admin`.
