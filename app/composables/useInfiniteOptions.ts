import type { Paginated } from '#shared/schemas'
import { useInfiniteQuery } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { computed, reactive, ref, toValue } from 'vue'

type FetchPage<T> = (params: {
  page: number
  pageSize: number
  search: string
}) => Promise<Paginated<T>>

interface BaseInfiniteOptionsConfig<T> {
  queryKey: MaybeRefOrGetter<unknown[]>
  resolveById?: (id: string) => Promise<T | null | undefined>
  pageSize?: number
  enabled?: MaybeRefOrGetter<boolean>
  /** Extra query params merged into endpoint requests (e.g. a `speciesId` scope). */
  query?: MaybeRefOrGetter<Record<string, unknown>>
}

/**
 * Either point at a REST endpoint — `GET {endpoint}?page&pageSize&search` returns `Paginated<T>`
 * and `GET {endpoint}/{id}` returns the record — or pass a custom `fetchPage` for anything else.
 */
export type InfiniteOptionsConfig<T> = BaseInfiniteOptionsConfig<T> &
  (
    | { endpoint: string; fetchPage?: never }
    | { endpoint?: never; fetchPage: FetchPage<T> }
  )

/**
 * Reusable infinite-pagination state for an async, searchable option list. Wraps TanStack
 * `useInfiniteQuery` and returns a reactive object an `AsyncCombobox` consumes directly:
 * `const vaccines = useInfiniteOptions({ ... })` → `vaccines.items`, `vaccines.loadMore()`, etc.
 *
 * ```ts
 * const vaccines = useInfiniteOptions<VaccineDto>({
 *   queryKey: ['vaccines'],
 *   endpoint: '/api/admin/vaccines',
 * })
 * ```
 */
export function useInfiniteOptions<T>(config: InfiniteOptionsConfig<T>) {
  const pageSize = config.pageSize ?? 15
  const search = ref('')
  const api = useRequestFetch()

  // Build fetch + by-id from the endpoint unless the caller supplied its own.
  const fetchPage: FetchPage<T> =
    config.fetchPage ??
    (({ page, pageSize: size, search: q }) =>
      api<Paginated<T>>(config.endpoint!, {
        query: {
          page,
          pageSize: size,
          search: q,
          ...(config.query ? toValue(config.query) : {}),
        },
      }))

  const resolveById =
    config.resolveById ??
    (config.endpoint
      ? (id: string) => api<T>(`${config.endpoint}/${id}`)
      : undefined)

  const query = useInfiniteQuery({
    queryKey: computed(() => [
      ...toValue(config.queryKey),
      'infinite',
      search.value,
    ]),
    queryFn: ({ pageParam }) =>
      fetchPage({ page: pageParam, pageSize, search: search.value }),
    initialPageParam: 1,
    getNextPageParam: (last: Paginated<T>) =>
      last.page * last.pageSize < last.total ? last.page + 1 : undefined,
    enabled: computed(() =>
      config.enabled === undefined ? true : toValue(config.enabled),
    ),
    staleTime: 60_000,
  })

  const items = computed<T[]>(
    () => query.data.value?.pages.flatMap((p) => p.items) ?? [],
  )

  function setSearch(value: string) {
    search.value = value
  }

  function loadMore() {
    if (
      !query.isFetching.value &&
      !query.isFetchingNextPage.value &&
      query.hasNextPage.value
    ) {
      query.fetchNextPage()
    }
  }

  return reactive({
    items,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    loadMore,
    setSearch,
    resolveById,
  })
}
