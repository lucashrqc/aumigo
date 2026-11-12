import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import type { Paginated, UserListQuery } from '#shared/schemas'
import type { UserDto } from '#shared/types'

type UserListParams = MaybeRefOrGetter<Partial<UserListQuery>>

/** Admin: paginated, searchable list of all platform users. */
export function useAdminUsersQuery(params: UserListParams = () => ({})) {
  const api = useRequestFetch()
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: () =>
      api<Paginated<UserDto>>('/api/admin/users', { query: toValue(params) }),
  })
}

/** Admin: permanently delete a user. */
export function useDeleteUser() {
  const api = useRequestFetch()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api(`/api/admin/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })
}
