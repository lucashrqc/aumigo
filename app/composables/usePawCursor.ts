import { gsap } from 'gsap'
import { computed, onMounted, ref, watch } from 'vue'
import { useEventListener, useMediaQuery } from '@vueuse/core'

export function usePawCursor() {
  const finePointer = useMediaQuery('(pointer: fine)')
  const prefersReduced = useMediaQuery('(prefers-reduced-motion: reduce)')
  const enabled = computed(() => finePointer.value && !prefersReduced.value)

  const cursorEl = ref<HTMLElement | null>(null)
  const visible = ref(false)
  const pressed = ref(false)
  const hovering = ref(false)

  let setX: ((value: number) => void) | null = null
  let setY: ((value: number) => void) | null = null

  watch(cursorEl, (el) => {
    if (!el) {
      setX = null
      setY = null
      return
    }
    setX = gsap.quickTo(el, 'x', { duration: 0.05, ease: 'power2' })
    setY = gsap.quickTo(el, 'y', { duration: 0.05, ease: 'power2' })
  })

  onMounted(() => {
    if (!import.meta.client) return

    useEventListener(window, 'pointermove', (event: PointerEvent) => {
      if (!enabled.value || event.pointerType !== 'mouse' || !setX || !setY)
        return
      visible.value = true
      setX(event.clientX)
      setY(event.clientY)
      hovering.value = !!(event.target as Element | null)?.closest(
        'a, button, [role="button"], input, textarea, select, label',
      )
    })

    useEventListener(window, 'pointerdown', () => (pressed.value = true))
    useEventListener(window, 'pointerup', () => (pressed.value = false))
    useEventListener(document, 'pointerleave', () => (visible.value = false))
  })

  return { cursorEl, enabled, visible, pressed, hovering }
}
