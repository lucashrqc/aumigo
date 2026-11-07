import type { IbgeResolveDto } from '#shared/types'
import { useQuery } from '@tanstack/vue-query'
import { refDebounced } from '@vueuse/core'
import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'

interface BrasilApiCepDto {
  cep: string
  state: string
  city: string
  neighborhood: string
  street: string
  service: string
  ibge: { city: string; state: string }
}

export interface CepResult {
  cep: string
  street: string
  neighborhood: string
  state: IbgeResolveDto['state']
  city: IbgeResolveDto['city']
}

export function useCep(zipCode: MaybeRefOrGetter<string>) {
  const api = useRequestFetch()
  const digits = computed(() => toValue(zipCode).replace(/\D/g, ''))
  const debounced = refDebounced(digits, 300)
  const enabled = computed(() => debounced.value.length === 8)

  return useQuery<CepResult>({
    queryKey: ['cep', debounced],
    enabled,
    retry: false,
    staleTime: Infinity,
    queryFn: async () => {
      const cep = debounced.value
      const info = await $fetch<BrasilApiCepDto>(
        `https://brasilapi.com.br/api/cep/v1/${cep}`,
      )
      const resolved = await api<IbgeResolveDto>('/api/locations/resolve', {
        query: { stateIbgeId: info.ibge.state, cityIbgeId: info.ibge.city },
      })
      return {
        cep: info.cep,
        street: info.street,
        neighborhood: info.neighborhood,
        state: resolved.state,
        city: resolved.city,
      }
    },
  })
}
