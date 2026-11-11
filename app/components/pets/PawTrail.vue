<script setup lang="ts">
import { ref } from 'vue'
import type { ColumnPaw } from '@/composables/useColumnPawTrail'

const box = ref<HTMLElement | null>(null)
const pathEl = ref<SVGPathElement | null>(null)

const { paws, stampProgress, d, width, height } = useColumnPawTrail({
  box,
  path: pathEl,
  unitH: (w) => (w < 640 ? 440 : 700),
  spacing: (w) => (w < 640 ? 13 : 17),
  lateral: (w) => (w < 640 ? 7 : 12),
})

function pawStyle(paw: ColumnPaw, index: number, total: number) {
  const t = stampProgress(index, total)
  const scale = 0.5 + 0.5 * t
  return {
    transform: `translate(${paw.x}px, ${paw.y}px) translate(-50%, -50%) rotate(${paw.angle}deg) scale(${scale})`,
    opacity: (t * 0.8).toFixed(3),
  }
}
</script>

<template>
  <div ref="box" class="pointer-events-none absolute inset-0 -z-10">
    <svg
      :viewBox="`0 0 ${width || 1} ${height || 1}`"
      fill="none"
      preserveAspectRatio="none"
      class="h-full w-full text-brand opacity-70"
    >
      <path
        ref="pathEl"
        :d="d"
        stroke="currentColor"
        stroke-width="3"
        stroke-dasharray="1 16"
        stroke-linecap="round"
      />
    </svg>

    <div class="absolute inset-0">
      <span
        v-for="(paw, i) in paws"
        :key="i"
        class="absolute left-0 top-0 text-forest/90"
        :style="pawStyle(paw, i, paws.length)"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" class="size-4 lg:size-6.5">
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
</template>
