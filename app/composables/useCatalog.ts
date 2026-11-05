import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import type { BreedCreateInput, SpeciesCreateInput } from '#shared/schemas'

export function useSpeciesQuery() {
  const api = useRequestFetch()
  return useQuery({
    queryKey: ['species'],
    queryFn: () => api<SpeciesDto[]>('/api/species'),
  })
}

export function useBreedsQuery(speciesId: MaybeRefOrGetter<string | undefined> = () => undefined) {
  const api = useRequestFetch()
  return useQuery({
    queryKey: ['breeds', speciesId],
    queryFn: () => api<BreedDto[]>('/api/breeds', { query: { speciesId: toValue(speciesId) } }),
  })
}

export function useCreateSpecies() {
  const api = useRequestFetch()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: SpeciesCreateInput) =>
      api<SpeciesDto>('/api/admin/species', { method: 'POST', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['species'] }),
  })
}

export function useCreateBreed() {
  const api = useRequestFetch()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: BreedCreateInput) =>
      api<BreedDto>('/api/admin/breeds', { method: 'POST', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['breeds'] }),
  })
}
