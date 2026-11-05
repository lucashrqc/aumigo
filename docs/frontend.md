# Frontend

Nuxt 4 app (`app/`), Vue 3 `<script setup>` + TypeScript. SSR with client
hydration. See [architecture.md](architecture.md) for the full picture.

## Stack

- **Nuxt 4** (compatibility v4), Vue 3, TypeScript strict.
- **UI:** shadcn-vue (reka-ui primitives) in `app/components/ui/**`, Tailwind CSS v4
  (`@tailwindcss/vite`, config-less; entry `app/assets/css/tailwind.css`).
- **Icons:** lucide-vue-next. **Toasts:** vue-sonner (`<Toaster />` in `app.vue`).
- **Server state:** TanStack Query (`@tanstack/vue-query`), SSR-hydrated.
- **Tables:** TanStack Table (`@tanstack/vue-table`) via `DataTable.vue`.
- **Client state:** Pinia — `useAuthStore` (the only global store).
- **Color mode:** `@nuxtjs/color-mode` (system preference, class-based).

## Folder structure

```
app/
  pages/
    (public)/**       Public routes: index, pets, pets/[id], login, register, applications
    (private)/admin/** Admin panel: dashboard, pets, vaccines, applications, staff
  layouts/            public.vue, private.vue (admin shell: sidebar + sign-out)
  components/
    ui/**             shadcn-vue primitives (Button, Card, Dialog, Table, Select, …)
    *.vue             App components: PetCard, PetForm, DataTable, Pagination
  composables/**      TanStack Query wrappers per domain (usePets, useApplications, …)
  middleware/         auth.ts, staff.ts, admin.ts (route guards)
  plugins/            auth.ts (hydrate session), vue-query.ts (SSR hydration)
  stores/auth.ts      Pinia auth store
  lib/                auth-client.ts (BetterAuth browser client), utils.ts (cn())
  utils/errors.ts     resolveErrorMessage()
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
- **Types:** request types come from `#shared/schemas` (Zod-inferred); response
  DTOs (`PetDto`, …) are globally available from `shared/types`.
- **Styling:** compose class names with `cn()` from `app/lib/utils.ts`. Prefer
  existing `components/ui` primitives before adding new ones.

## Run locally

See [backend.md](backend.md#run-the-app-locally) — the frontend is served by the
same `pnpm dev` (http://localhost:3000). The admin panel is at `/admin`.
