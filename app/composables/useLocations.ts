import type { CityDto, StateDto } from '#shared/types'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'

export type StateOption = StateDto
export type CityOption = CityDto

export function useStateOptions() {
  return useInfiniteOptions<StateOption>({
    queryKey: ['state-options'],
    endpoint: '/api/locations/states',
  })
}

export function useCityOptions(stateId: MaybeRefOrGetter<string | undefined>) {
  return useInfiniteOptions<CityOption>({
    queryKey: () => ['city-options', toValue(stateId) ?? null],
    endpoint: '/api/locations/cities',
    enabled: () => !!toValue(stateId),
    query: () => ({ stateId: toValue(stateId) }),
  })
}
