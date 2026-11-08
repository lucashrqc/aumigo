import { useQuery } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import type { AnalyticsQuery } from '#shared/schemas'

type AnalyticsParams = MaybeRefOrGetter<Partial<AnalyticsQuery>>

/** Admin dashboard analytics: KPI cards + pets per month. */
export function useAdminAnalyticsQuery(params: AnalyticsParams = () => ({})) {
  const api = useRequestFetch()
  return useQuery({
    queryKey: ['admin-analytics', params],
    queryFn: () =>
      api<AdminAnalyticsDto>('/api/admin/analytics', {
        query: toValue(params),
      }),
  })
}
