import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import type {
  AppliedVaccineCreateInput,
  Paginated,
  VaccineCreateInput,
  VaccineListQuery,
  VaccineUpdateInput,
} from '#shared/schemas'

type VaccineListParams = MaybeRefOrGetter<Partial<VaccineListQuery>>

/** Admin: paginated vaccine catalog. */
export function useAdminVaccinesQuery(params: VaccineListParams = () => ({})) {
  const api = useRequestFetch()
  return useQuery({
    queryKey: ['admin-vaccines', params],
    queryFn: () => api<Paginated<VaccineDto>>('/api/admin/vaccines', { query: toValue(params) }),
  })
}

/** Admin: single vaccine. */
export function useVaccineQuery(id: MaybeRefOrGetter<string>) {
  const api = useRequestFetch()
  return useQuery({
    queryKey: ['admin-vaccine', id],
    queryFn: () => api<VaccineDto>(`/api/admin/vaccines/${toValue(id)}`),
  })
}

/** Flat vaccine list — for selects (e.g. recording an applied vaccine). */
export function useVaccinesQuery() {
  const api = useRequestFetch()
  return useQuery({
    queryKey: ['vaccines'],
    queryFn: async () => {
      const res = await api<Paginated<VaccineDto>>('/api/admin/vaccines', {
        query: { pageSize: 100 },
      })
      return res.items
    },
  })
}

export function useCreateVaccine() {
  const api = useRequestFetch()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: VaccineCreateInput) =>
      api<VaccineDto>('/api/admin/vaccines', { method: 'POST', body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-vaccines'] })
      qc.invalidateQueries({ queryKey: ['vaccines'] })
    },
  })
}

export function useUpdateVaccine() {
  const api = useRequestFetch()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: VaccineUpdateInput }) =>
      api<VaccineDto>(`/api/admin/vaccines/${id}`, { method: 'PATCH', body }),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['admin-vaccines'] })
      qc.invalidateQueries({ queryKey: ['admin-vaccine', id] })
      qc.invalidateQueries({ queryKey: ['vaccines'] })
    },
  })
}

export function useDeleteVaccine() {
  const api = useRequestFetch()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api(`/api/admin/vaccines/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-vaccines'] })
      qc.invalidateQueries({ queryKey: ['vaccines'] })
    },
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
    onSuccess: (_data, body) => qc.invalidateQueries({ queryKey: ['pet-vaccines', body.petId] }),
  })
}
