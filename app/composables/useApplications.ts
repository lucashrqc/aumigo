import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type {
  AdoptionApplicationCreateInput,
  AdoptionApplicationListQuery,
  AdoptionApplicationReviewInput,
  Paginated,
} from '#shared/schemas'

/** Adopter: submit an application. */
export function useApplyForPet() {
  const api = useRequestFetch()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: AdoptionApplicationCreateInput) =>
      api<AdoptionApplicationDto>('/api/applications', { method: 'POST', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-applications'] }),
  })
}

/** Adopter: cancel their own pending application. */
export function useCancelMyApplication() {
  const api = useRequestFetch()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api<AdoptionApplicationDto>(`/api/applications/${id}/cancel`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-applications'] }),
  })
}

/** Adopter: own applications. */
export function useMyApplicationsQuery() {
  const api = useRequestFetch()
  const auth = useAuthStore()
  return useQuery({
    queryKey: ['my-applications'],
    queryFn: () => api<AdoptionApplicationDto[]>('/api/applications/me'),
    enabled: () => auth.isAuthenticated,
  })
}

export function isActiveApplication(app: AdoptionApplicationDto) {
  return app.status === 'pending' || app.status === 'approved'
}

export function useAppliedPetIds() {
  const { data } = useMyApplicationsQuery()
  return computed(
    () =>
      new Set(
        (data.value ?? []).filter(isActiveApplication).map((a) => a.petId),
      ),
  )
}

export function useEnsureMyApplications() {
  const api = useRequestFetch()
  const qc = useQueryClient()
  return () =>
    qc.ensureQueryData({
      queryKey: ['my-applications'],
      queryFn: () => api<AdoptionApplicationDto[]>('/api/applications/me'),
    })
}

/** Admin: list applications. */
export function useAdminApplicationsQuery(
  params: MaybeRefOrGetter<Partial<AdoptionApplicationListQuery>> = () => ({}),
) {
  const api = useRequestFetch()
  return useQuery({
    queryKey: ['admin-applications', params],
    queryFn: () =>
      api<Paginated<AdoptionApplicationDto>>('/api/admin/applications', {
        query: toValue(params),
      }),
  })
}

/** Admin: aggregate application counts for the dashboard cards. */
export function useAdminApplicationStatsQuery() {
  const api = useRequestFetch()
  return useQuery({
    queryKey: ['admin-application-stats'],
    queryFn: () => api<AdoptionApplicationStatsDto>('/api/admin/applications/stats'),
  })
}

/** Admin: approve or reject an application. */
export function useReviewApplication() {
  const api = useRequestFetch()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: AdoptionApplicationReviewInput }) =>
      api<AdoptionApplicationDto>(`/api/admin/applications/${id}/review`, {
        method: 'POST',
        body,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-applications'] })
      qc.invalidateQueries({ queryKey: ['admin-application-stats'] })
      qc.invalidateQueries({ queryKey: ['admin-pets'] })
    },
  })
}

/** Admin: cancel an application; a canceled approval frees the pet. */
export function useCancelApplication() {
  const api = useRequestFetch()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api<AdoptionApplicationDto>(`/api/admin/applications/${id}/cancel`, { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-applications'] })
      qc.invalidateQueries({ queryKey: ['admin-application-stats'] })
      qc.invalidateQueries({ queryKey: ['admin-pets'] })
      qc.invalidateQueries({ queryKey: ['admin-pet-stats'] })
    },
  })
}
