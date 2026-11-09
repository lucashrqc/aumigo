import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { onBeforeUnmount, onMounted } from 'vue'

export function useLenisScroll() {
  const lenis = shallowRef<Lenis | null>(null)
  const { public: config } = useRuntimeConfig()
  const reducedMotion = usePrefersReducedMotion()

  function tick(time: number) {
    lenis.value?.raf(time * 1000)
  }

  onMounted(() => {
    if (!import.meta.client || reducedMotion.value) return

    const instance = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
      respectReducedMotion: config.respectReducedMotion,
    })
    lenis.value = instance

    instance.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
  })

  onBeforeUnmount(() => {
    gsap.ticker.remove(tick)
    lenis.value?.destroy()
    lenis.value = null
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
  })

  return { lenis }
}
