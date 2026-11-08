<script setup lang="ts">
const { cursorEl, enabled, visible, pressed, hovering } = usePawCursor()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="enabled"
      ref="cursorEl"
      class="paw-cursor"
      :class="{ 'is-visible': visible }"
      aria-hidden="true"
    >
      <div
        class="paw-cursor__inner"
        :class="{ 'is-pressed': pressed, 'is-hovering': hovering }"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" class="size-6">
          <circle cx="11" cy="4" r="2" />
          <circle cx="18" cy="8" r="2" />
          <circle cx="20" cy="16" r="2" />
          <path
            d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"
          />
        </svg>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.paw-cursor {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
  will-change: transform;
}

.paw-cursor.is-visible {
  opacity: 1;
}

.paw-cursor__inner {
  position: absolute;
  color: var(--forest);
  transform: translate(-50%, -50%) rotate(-18deg) scale(1);
  transition:
    transform 0.18s ease,
    color 0.18s ease;
}

.paw-cursor__inner.is-hovering {
  color: var(--brand);
  transform: translate(-50%, -50%) rotate(-18deg) scale(1.55);
}

.paw-cursor__inner.is-pressed {
  transform: translate(-50%, -50%) rotate(-18deg) scale(0.82);
}
</style>
