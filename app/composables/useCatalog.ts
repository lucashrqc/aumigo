import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import type {
  BreedCreateInput,
  BreedListQuery,
  BreedUpdateInput,
  Paginated,
  SpeciesCreateInput,
  SpeciesListQuery,
  SpeciesUpdateInput,
} from '#shared/schemas'

type SpeciesListParams = MaybeRefOrGetter<Partial<SpeciesListQuery>>
type BreedListParams = MaybeRefOrGetter<Partial<BreedListQuery>>

export function useSpeciesQuery() {
  const api = useRequestFetch()
  return useQuery({
    queryKey: ['species'],
    queryFn: () => api<SpeciesDto[]>('/api/species'),
  })
}

export function useBreedsQuery(
  speciesId: MaybeRefOrGetter<string | undefined> = () => undefined,
) {
  const api = useRequestFetch()
  return useQuery({
    queryKey: ['breeds', speciesId],
    queryFn: () =>
      api<BreedDto[]>('/api/breeds', {
        query: { speciesId: toValue(speciesId) },
      }),
  })
}

/** Infinite, searchable species options for `AsyncCombobox`. */
export function useSpeciesOptions() {
  return useInfiniteOptions<SpeciesDto>({
    queryKey: ['species-options'],
    endpoint: '/api/admin/species',
  })
}

/** Infinite, searchable breed options for `AsyncCombobox`, scoped to the selected species. */
export function useBreedOptions(
  speciesId: MaybeRefOrGetter<string | undefined>,
) {
  return useInfiniteOptions<BreedDto>({
    queryKey: () => ['breed-options', toValue(speciesId) ?? null],
    endpoint: '/api/admin/breeds',
    enabled: () => !!toValue(speciesId),
    query: () => ({ speciesId: toValue(speciesId) }),
  })
}

/** Admin: paginated species catalog. */
export function useAdminSpeciesQuery(params: SpeciesListParams = () => ({})) {
  const api = useRequestFetch()
  return useQuery({
    queryKey: ['admin-species', params],
    queryFn: () =>
      api<Paginated<SpeciesDto>>('/api/admin/species', { query: toValue(params) }),
  })
}

/** Admin: single species. */
export function useSpeciesByIdQuery(id: MaybeRefOrGetter<string>) {
  const api = useRequestFetch()
  return useQuery({
    queryKey: ['admin-species-item', id],
    queryFn: () => api<SpeciesDto>(`/api/admin/species/${toValue(id)}`),
  })
}

/** Admin: paginated breed catalog. */
export function useAdminBreedsQuery(params: BreedListParams = () => ({})) {
  const api = useRequestFetch()
  return useQuery({
    queryKey: ['admin-breeds', params],
    queryFn: () =>
      api<Paginated<BreedDto>>('/api/admin/breeds', { query: toValue(params) }),
  })
}

/** Admin: single breed. */
export function useBreedByIdQuery(id: MaybeRefOrGetter<string>) {
  const api = useRequestFetch()
  return useQuery({
    queryKey: ['admin-breed-item', id],
    queryFn: () => api<BreedDto>(`/api/admin/breeds/${toValue(id)}`),
  })
}

export function useCreateSpecies() {
  const api = useRequestFetch()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: SpeciesCreateInput) =>
      api<SpeciesDto>('/api/admin/species', { method: 'POST', body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['species'] })
      qc.invalidateQueries({ queryKey: ['admin-species'] })
    },
  })
}

export function useUpdateSpecies() {
  const api = useRequestFetch()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: SpeciesUpdateInput }) =>
      api<SpeciesDto>(`/api/admin/species/${id}`, { method: 'PATCH', body }),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['species'] })
      qc.invalidateQueries({ queryKey: ['admin-species'] })
      qc.invalidateQueries({ queryKey: ['admin-species-item', id] })
    },
  })
}

export function useDeleteSpecies() {
  const api = useRequestFetch()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api(`/api/admin/species/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['species'] })
      qc.invalidateQueries({ queryKey: ['admin-species'] })
    },
  })
}

export function useCreateBreed() {
  const api = useRequestFetch()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: BreedCreateInput) =>
      api<BreedDto>('/api/admin/breeds', { method: 'POST', body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['breeds'] })
      qc.invalidateQueries({ queryKey: ['admin-breeds'] })
    },
  })
}

export function useUpdateBreed() {
  const api = useRequestFetch()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: BreedUpdateInput }) =>
      api<BreedDto>(`/api/admin/breeds/${id}`, { method: 'PATCH', body }),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['breeds'] })
      qc.invalidateQueries({ queryKey: ['admin-breeds'] })
      qc.invalidateQueries({ queryKey: ['admin-breed-item', id] })
    },
  })
}

export function useDeleteBreed() {
  const api = useRequestFetch()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api(`/api/admin/breeds/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['breeds'] })
      qc.invalidateQueries({ queryKey: ['admin-breeds'] })
    },
  })
}
