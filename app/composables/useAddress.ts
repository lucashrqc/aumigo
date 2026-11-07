import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { AddressUpsertInput } from '#shared/schemas'
import type { AddressDto } from '#shared/types'

export function useAddressQuery() {
  const api = useRequestFetch()
  return useQuery({
    queryKey: ['address'],
    queryFn: () => api<AddressDto | null>('/api/me/address'),
  })
}

export function useUpdateAddress() {
  const api = useRequestFetch()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: AddressUpsertInput) =>
      api<AddressDto>('/api/me/address', { method: 'PUT', body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['address'] })
    },
  })
}
