import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  type Ref,
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'
import { useDebounceFn, useElementSize } from '@vueuse/core'

export interface ColumnPaw {
  x: number
  y: number
  angle: number
}

interface UseColumnPawTrailParams {
  box: Ref<HTMLElement | null>
  path: Ref<SVGPathElement | null>
  unitH: (width: number) => number
  spacing: (width: number) => number
  lateral: (width: number) => number
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

type TileSegment = [number, number, number, number, number, number]

const TILE_SEGMENTS: TileSegment[] = [
  [0.88, 0.02, 1.03, 0.14, 0.95, 0.3],
  [0.88, 0.47, 0.63, 0.45, 0.69, 0.27],
  [0.73, 0.12, 0.96, 0.19, 0.88, 0.42],
  [0.8, 0.67, 0.15, 0.54, 0.06, 0.75],
  [-0.02, 0.87, 0.33, 0.98, 0.5, 1.0],
]

const TILE_START_X = 0.5

function buildPath(width: number, height: number, unitH: number) {
  if (width <= 0 || height <= 0 || unitH <= 0) return ''

  const tiles = Math.max(1, Math.ceil(height / unitH))
  let d = `M ${(TILE_START_X * width).toFixed(1)} 0`

  for (let k = 0; k < tiles; k++) {
    const oy = k * unitH
    for (const [c1x, c1y, c2x, c2y, x, y] of TILE_SEGMENTS) {
      d +=
        ` C ${(c1x * width).toFixed(1)} ${(oy + c1y * unitH).toFixed(1)}` +
        ` ${(c2x * width).toFixed(1)} ${(oy + c2y * unitH).toFixed(1)}` +
        ` ${(x * width).toFixed(1)} ${(oy + y * unitH).toFixed(1)}`
    }
  }

  return d
}

export function useColumnPawTrail({
  box,
  path,
  unitH,
  spacing,
  lateral,
}: UseColumnPawTrailParams) {
  const reducedMotion = usePrefersReducedMotion()
  const { width, height } = useElementSize(box)

  const paws = ref<ColumnPaw[]>([])
  const progress = ref(0)
  const d = computed(() => buildPath(width.value, height.value, unitH(width.value)))

  let trigger: ScrollTrigger | null = null

  function rebuild() {
    const pathEl = path.value
    const w = width.value
    const h = height.value
    if (!pathEl || w === 0 || h === 0) {
      paws.value = []
      return
    }

    const total = pathEl.getTotalLength()
    if (!total) {
      paws.value = []
      return
    }

    const space = spacing(w)
    const lat = lateral(w)
    const count = Math.max(2, Math.round(h / space))
    const eps = Math.min(8, total / 4)
    const at = (length: number) =>
      pathEl.getPointAtLength(Math.max(0, Math.min(total, length)))

    const next: ColumnPaw[] = []
    for (let i = 0; i < count; i++) {
      const length = (total * (i + 0.5)) / count
      const here = at(length)
      const ahead = at(length + eps)
      const behind = at(length - eps)

      const dx = ahead.x - behind.x
      const dy = ahead.y - behind.y
      const len = Math.hypot(dx, dy) || 1
      const normalX = -dy / len
      const normalY = dx / len
      const side = i % 2 === 0 ? 1 : -1

      next.push({
        x: here.x + normalX * lat * side,
        y: here.y + normalY * lat * side,
        angle: (Math.atan2(dy, dx) * 180) / Math.PI + 90 + side * 6,
      })
    }

    paws.value = next
    if (import.meta.client) ScrollTrigger.refresh()
  }

  const rebuildDebounced = useDebounceFn(rebuild, 120)

  function setupTrigger() {
    if (!box.value || reducedMotion.value) {
      progress.value = 1
      return
    }
    trigger = ScrollTrigger.create({
      trigger: box.value,
      start: 'top 40%',
      end: 'bottom 40%',
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

  watch([width, height], () => rebuildDebounced(), { flush: 'post' })

  onBeforeUnmount(() => {
    trigger?.kill()
    trigger = null
  })

  function stampProgress(index: number, count: number) {
    if (reducedMotion.value) return 1
    if (count === 0) return 0
    return clamp01(progress.value * count - index - 0.15)
  }

  return { paws, stampProgress, d, width, height }
}
