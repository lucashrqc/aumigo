import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import type { AppliedVaccineCreateInput, VaccineCreateInput } from '#shared/schemas'

export function useVaccinesQuery() {
  const api = useRequestFetch()
  return useQuery({
    queryKey: ['vaccines'],
    queryFn: () => api<VaccineDto[]>('/api/admin/vaccines'),
  })
}

export function useCreateVaccine() {
  const api = useRequestFetch()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: VaccineCreateInput) =>
      api<VaccineDto>('/api/admin/vaccines', { method: 'POST', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vaccines'] }),
  })
}

export function usePetVaccinesQuery(petId: MaybeRefOrGetter<string>) {
  const api = useRequestFetch()
  return useQuery({
    queryKey: ['pet-vaccines', petId],
    queryFn: () => api<AppliedVaccineDto[]>(`/api/admin/pets/${toValue(petId)}/applied-vaccines`),
  })
}

export function useApplyVaccine() {
  const api = useRequestFetch()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: AppliedVaccineCreateInput) =>
      api<AppliedVaccineDto>('/api/admin/applied-vaccines', { method: 'POST', body }),
    onSuccess: (_data, body) =>
      qc.invalidateQueries({ queryKey: ['pet-vaccines', body.petId] }),
  })
}
