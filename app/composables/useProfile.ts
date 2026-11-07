import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { ProfileUpdateInput } from '#shared/schemas'
import type { ProfileDto } from '#shared/types'

export function useProfileQuery() {
  const api = useRequestFetch()
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => api<ProfileDto>('/api/me/profile'),
  })
}

export function useUpdateProfile() {
  const api = useRequestFetch()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: ProfileUpdateInput) =>
      api<ProfileDto>('/api/me/profile', { method: 'PATCH', body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
