<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

const props = defineProps<{
  class?: HTMLAttributes['class']
  message?: string
}>()
</script>

<template>
  <div
    :class="props.class"
    class="flex items-center justify-center text-sm text-muted-foreground"
  >
    {{ props.message ?? 'Nenhum resultado encontrado' }}
  </div>
</template>
