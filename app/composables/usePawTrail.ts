import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  type Ref,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'
import { useMediaQuery, useResizeObserver } from '@vueuse/core'

export interface Paw {
  x: number
  y: number
  angle: number
}

interface Variant {
  path: Ref<SVGPathElement | null>
  box: Ref<HTMLElement | null>
  viewBox: { w: number; h: number }
  spacing: number
  lateral: number
}

interface UsePawTrailParams {
  section: Ref<HTMLElement | null>
  desktop: Variant
  mobile: Variant
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

function buildPaws(variant: Variant): Paw[] {
  const path = variant.path.value
  const box = variant.box.value
  if (!path || !box) return []

  const boxW = box.clientWidth
  const boxH = box.clientHeight
  if (boxW === 0 || boxH === 0) return []

  const scaleX = boxW / variant.viewBox.w
  const scaleY = boxH / variant.viewBox.h
  const total = path.getTotalLength()
  const count = Math.max(2, Math.round(boxH / variant.spacing))

  const toPixel = (length: number) => {
    const p = path.getPointAtLength(Math.max(0, Math.min(total, length)))
    return { x: p.x * scaleX, y: p.y * scaleY }
  }

  const paws: Paw[] = []
  for (let i = 0; i < count; i++) {
    const length = (total * (i + 0.5)) / count
    const here = toPixel(length)
    const ahead = toPixel(length + total * 0.01)
    const behind = toPixel(length - total * 0.01)

    const dx = ahead.x - behind.x
    const dy = ahead.y - behind.y
    const len = Math.hypot(dx, dy) || 1
    const normalX = -dy / len
    const normalY = dx / len
    const side = i % 2 === 0 ? 1 : -1

    paws.push({
      x: here.x + normalX * variant.lateral * side,
      y: here.y + normalY * variant.lateral * side,
      angle: (Math.atan2(dy, dx) * 180) / Math.PI + 90 + side * 6,
    })
  }

  return paws
}

export function usePawTrail({ section, desktop, mobile }: UsePawTrailParams) {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const reducedMotion = usePrefersReducedMotion()

  const desktopPaws = ref<Paw[]>([])
  const mobilePaws = ref<Paw[]>([])
  const progress = ref(0)

  let trigger: ScrollTrigger | null = null

  function rebuild() {
    if (!import.meta.client) return
    if (isDesktop.value) {
      desktopPaws.value = buildPaws(desktop)
      mobilePaws.value = []
    } else {
      mobilePaws.value = buildPaws(mobile)
      desktopPaws.value = []
    }
    ScrollTrigger.refresh()
  }

  function setupTrigger() {
    if (!section.value || reducedMotion.value) {
      progress.value = 1
      return
    }
    trigger = ScrollTrigger.create({
      trigger: section.value,
      start: 'top 75%',
      end: 'bottom 65%',
      scrub: true,
      onUpdate: (self) => {
        progress.value = self.progress
      },
    })
  }

  onMounted(() => {
    if (!import.meta.client) return
    rebuild()
    setupTrigger()
  })

  useResizeObserver(desktop.box, () => isDesktop.value && rebuild())
  useResizeObserver(mobile.box, () => !isDesktop.value && rebuild())
  watch(isDesktop, () => rebuild())

  onBeforeUnmount(() => {
    trigger?.kill()
    trigger = null
  })

  function stampProgress(index: number, count: number) {
    if (reducedMotion.value) return 1
    if (count === 0) return 0
    return clamp01(progress.value * count - index + 0.2)
  }

  return { desktopPaws, mobilePaws, reducedMotion, stampProgress }
}
