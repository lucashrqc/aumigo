import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { InvitationCreateInput } from '#shared/schemas'

export function useInvitationsQuery() {
  const api = useRequestFetch()
  return useQuery({
    queryKey: ['invitations'],
    queryFn: () => api<InvitationDto[]>('/api/admin/invitations'),
  })
}

export function useCreateInvitation() {
  const api = useRequestFetch()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: InvitationCreateInput) =>
      api<InvitationDto>('/api/admin/invitations', { method: 'POST', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invitations'] }),
  })
}
