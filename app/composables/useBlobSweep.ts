import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

/** Admin: dry-run orphaned-blob report (never deletes). */
export function useBlobSweepQuery() {
  const api = useRequestFetch()
  return useQuery({
    queryKey: ['blob-sweep'],
    queryFn: () => api<BlobSweepReportDto>('/api/maintenance/blob-sweep'),
  })
}

/** Admin: delete eligible orphans, then refresh the report. */
export function useDeleteOrphans() {
  const api = useRequestFetch()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (minAgeHours?: number) =>
      api<BlobSweepReportDto>('/api/maintenance/blob-sweep', {
        query: {
          delete: 'true',
          ...(minAgeHours != null ? { minAgeHours } : {}),
        },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blob-sweep'] }),
  })
}
