import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import type { Paginated, PetCreateInput, PetListQuery, PetUpdateInput } from '#shared/schemas'

type PetListParams = MaybeRefOrGetter<Partial<PetListQuery>>

/** Public: list available pets. */
export function usePublicPetsQuery(params: PetListParams = () => ({})) {
  const api = useRequestFetch()
  return useQuery({
    queryKey: ['public-pets', params],
    queryFn: () => api<Paginated<PetDto>>('/api/pets', { query: toValue(params) }),
  })
}

/** Public: infinite-scroll list of available pets. */
export function usePublicPetsInfiniteQuery(params: PetListParams = () => ({})) {
  const api = useRequestFetch()
  return useInfiniteQuery({
    queryKey: computed(() => ['public-pets', 'infinite', toValue(params)]),
    queryFn: ({ pageParam }) =>
      api<Paginated<PetDto>>('/api/pets', {
        query: { ...toValue(params), page: pageParam },
      }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page * last.pageSize < last.total ? last.page + 1 : undefined,
  })
}

/** Public: single pet detail. */
export function usePublicPetQuery(
  id: MaybeRefOrGetter<string | undefined>,
  options: { enabled?: MaybeRefOrGetter<boolean> } = {},
) {
  const api = useRequestFetch()
  return useQuery({
    queryKey: ['public-pet', id],
    queryFn: () => api<PetDto>(`/api/pets/${toValue(id)}`),
    enabled: options.enabled,
  })
}

/** Admin: list pets (all statuses). */
export function useAdminPetsQuery(params: PetListParams = () => ({})) {
  const api = useRequestFetch()
  return useQuery({
    queryKey: ['admin-pets', params],
    queryFn: () => api<Paginated<PetDto>>('/api/admin/pets', { query: toValue(params) }),
  })
}

/** Admin: aggregate pet counts for the dashboard cards. */
export function useAdminPetStatsQuery() {
  const api = useRequestFetch()
  return useQuery({
    queryKey: ['admin-pet-stats'],
    queryFn: () => api<PetStatsDto>('/api/admin/pets/stats'),
  })
}

/** Admin: single pet. */
export function useAdminPetQuery(id: MaybeRefOrGetter<string>) {
  const api = useRequestFetch()
  return useQuery({
    queryKey: ['admin-pet', id],
    queryFn: () => api<PetDto>(`/api/admin/pets/${toValue(id)}`),
  })
}

export function useCreatePet() {
  const api = useRequestFetch()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: PetCreateInput) =>
      api<PetDto>('/api/admin/pets', { method: 'POST', body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-pets'] })
      qc.invalidateQueries({ queryKey: ['public-pets'] })
    },
  })
}

export function useUpdatePet() {
  const api = useRequestFetch()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: PetUpdateInput }) =>
      api<PetDto>(`/api/admin/pets/${id}`, { method: 'PATCH', body }),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['admin-pets'] })
      qc.invalidateQueries({ queryKey: ['admin-pet', id] })
      qc.invalidateQueries({ queryKey: ['public-pets'] })
      qc.invalidateQueries({ queryKey: ['public-pet', id] })
    },
  })
}

export function useDeletePet() {
  const api = useRequestFetch()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api(`/api/admin/pets/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-pets'] })
      qc.invalidateQueries({ queryKey: ['public-pets'] })
    },
  })
}

function invalidatePetLists(qc: ReturnType<typeof useQueryClient>, id: string) {
  qc.invalidateQueries({ queryKey: ['admin-pets'] })
  qc.invalidateQueries({ queryKey: ['admin-pet', id] })
  qc.invalidateQueries({ queryKey: ['admin-pet-stats'] })
  qc.invalidateQueries({ queryKey: ['public-pets'] })
  qc.invalidateQueries({ queryKey: ['public-pet', id] })
}

function invalidateApplicationLists(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['admin-applications'] })
  qc.invalidateQueries({ queryKey: ['admin-application-stats'] })
}

/** Admin: publish a pending pet (status -> available). */
export function usePublishPet() {
  const api = useRequestFetch()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api<PetDto>(`/api/admin/pets/${id}/publish`, { method: 'POST' }),
    onSuccess: (_data, id) => invalidatePetLists(qc, id),
  })
}

/** Admin: unpublish a pet (status -> pending); an adopted pet is also reverted. */
export function useUnpublishPet() {
  const api = useRequestFetch()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api<PetDto>(`/api/admin/pets/${id}/unpublish`, { method: 'POST' }),
    onSuccess: (_data, id) => {
      invalidatePetLists(qc, id)
      invalidateApplicationLists(qc)
    },
  })
}

/** Admin: mark a pet as adopted; open applications are auto-rejected. */
export function useMarkPetAdopted() {
  const api = useRequestFetch()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api<PetDto>(`/api/admin/pets/${id}/adopt`, { method: 'POST' }),
    onSuccess: (_data, id) => {
      invalidatePetLists(qc, id)
      invalidateApplicationLists(qc)
    },
  })
}
