import { computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'

export function usePrefersReducedMotion() {
  const { public: config } = useRuntimeConfig()
  const prefersReduced = useMediaQuery('(prefers-reduced-motion: reduce)')

  return computed(() => config.respectReducedMotion && prefersReduced.value)
}
