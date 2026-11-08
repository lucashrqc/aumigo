<script setup lang="ts">
import { ref } from 'vue'
import type { Paw } from '@/composables/usePawTrail'

const DESKTOP_PATH =
  'M90.5895 1.09222C196.824 101.092 204.201 171.092 93.5405 281.092C-31.8746 406.092 -24.4973 511.092 89.1141 596.092C211.578 691.092 202.725 791.092 87.6386 886.092C-28.9237 981.092 -25.9727 1091.09 89.1141 1196.09C201.25 1301.09 202.725 1411.09 90.5895 1511.09C41.899 1554.09 56.6537 1596.09 90.5895 1631.09'

const MOBILE_PATH =
  'M30 0C6 150 6 250 30 400C54 550 54 650 30 800C6 950 6 1050 30 1200'

const rootEl = ref<HTMLElement | null>(null)
const desktopBox = ref<HTMLElement | null>(null)
const desktopPath = ref<SVGPathElement | null>(null)
const mobileBox = ref<HTMLElement | null>(null)
const mobilePath = ref<SVGPathElement | null>(null)

const { desktopPaws, mobilePaws, stampProgress } = usePawTrail({
  section: rootEl,
  desktop: {
    path: desktopPath,
    box: desktopBox,
    viewBox: { w: 179, h: 1632.14 },
    spacing: 110,
    lateral: 11,
  },
  mobile: {
    path: mobilePath,
    box: mobileBox,
    viewBox: { w: 60, h: 1200 },
    spacing: 84,
    lateral: 6,
  },
})

function pawStyle(paw: Paw, index: number, total: number) {
  const t = stampProgress(index, total)
  const scale = 0.5 + 0.5 * t
  return {
    transform: `translate(${paw.x}px, ${paw.y}px) translate(-50%, -50%) rotate(${paw.angle}deg) scale(${scale})`,
    opacity: (t * 0.85).toFixed(3),
  }
}
</script>

<template>
  <div ref="rootEl" class="pointer-events-none absolute inset-0">
    <!-- Desktop: serpentine curve behind the cards -->
    <div
      ref="desktopBox"
      class="absolute left-1/2 top-0 hidden h-full w-44 -translate-x-1/2 lg:block"
    >
      <svg
        viewBox="0 0 179 1632.14"
        fill="none"
        preserveAspectRatio="none"
        class="h-full w-full text-brand opacity-80"
      >
        <path
          ref="desktopPath"
          :d="DESKTOP_PATH"
          stroke="currentColor"
          stroke-width="3"
          stroke-dasharray="1 14"
          stroke-linecap="round"
        />
      </svg>
      <div class="absolute inset-0">
        <span
          v-for="(paw, i) in desktopPaws"
          :key="i"
          class="absolute left-0 top-0 text-forest"
          :style="pawStyle(paw, i, desktopPaws.length)"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" class="size-6.5">
            <circle cx="11" cy="4" r="2" />
            <circle cx="18" cy="8" r="2" />
            <circle cx="20" cy="16" r="2" />
            <path
              d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"
            />
          </svg>
        </span>
      </div>
    </div>

    <!-- Mobile: gentle curve in a slim right-hand gutter -->
    <div ref="mobileBox" class="absolute inset-y-0 right-0 w-10 lg:hidden">
      <svg
        viewBox="0 0 60 1200"
        fill="none"
        preserveAspectRatio="none"
        class="h-full w-full text-brand opacity-80"
      >
        <path
          ref="mobilePath"
          :d="MOBILE_PATH"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-dasharray="1 12"
          stroke-linecap="round"
        />
      </svg>
      <div class="absolute inset-0">
        <span
          v-for="(paw, i) in mobilePaws"
          :key="i"
          class="absolute left-0 top-0 text-forest"
          :style="pawStyle(paw, i, mobilePaws.length)"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" class="size-4">
            <circle cx="11" cy="4" r="2" />
            <circle cx="18" cy="8" r="2" />
            <circle cx="20" cy="16" r="2" />
            <path
              d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"
            />
          </svg>
        </span>
      </div>
    </div>
  </div>
</template>
