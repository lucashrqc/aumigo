import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'

// TODO: the state/city catalogs aren't seeded yet (future IBGE import at
// /api/locations/states and /api/locations/cities). Until then these stay
// `enabled: false` and the selects render empty — drop `enabled` once the
// endpoints exist.

export interface StateOption {
  id: string
  name: string
  /** Two-letter UF code, e.g. "SP". */
  uf: string
}

export interface CityOption {
  id: string
  name: string
  stateId: string
}

export function useStateOptions() {
  return useInfiniteOptions<StateOption>({
    queryKey: ['state-options'],
    endpoint: '/api/locations/states',
    enabled: () => false,
  })
}

export function useCityOptions(stateId: MaybeRefOrGetter<string | undefined>) {
  return useInfiniteOptions<CityOption>({
    queryKey: () => ['city-options', toValue(stateId) ?? null],
    endpoint: '/api/locations/cities',
    enabled: () => false,
    query: () => ({ stateId: toValue(stateId) }),
  })
}
