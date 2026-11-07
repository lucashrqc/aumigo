<script setup lang="ts">
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from '@lucide/vue'

const props = defineProps<{ page: number; pageSize: number; total: number }>()
const emit = defineEmits<{ (e: 'update:page', page: number): void }>()

const totalPages = computed(() =>
  Math.max(1, Math.ceil(props.total / props.pageSize)),
)

const from = computed(() =>
  props.total === 0 ? 0 : (props.page - 1) * props.pageSize + 1,
)
const to = computed(() => Math.min(props.page * props.pageSize, props.total))

const pages = computed(() => {
  const count = Math.min(3, totalPages.value)
  const start = Math.min(
    Math.max(1, props.page - 1),
    totalPages.value - count + 1,
  )
  return Array.from({ length: count }, (_, i) => start + i)
})

function goTo(target: number) {
  const next = Math.min(Math.max(1, target), totalPages.value)
  if (next !== props.page) emit('update:page', next)
}
</script>

<template>
  <div v-if="totalPages > 1" class="flex items-center justify-end gap-3">
    <span class="text-xs text-muted-foreground"
      >{{ from }} - {{ to }} de {{ total }}</span
    >
    <div class="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        :disabled="page <= 1"
        @click="goTo(1)"
      >
        <ChevronsLeft />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        :disabled="page <= 1"
        @click="goTo(page - 1)"
      >
        <ChevronLeft />
      </Button>
      <Button
        v-for="p in pages"
        :key="p"
        :variant="p === page ? 'outline' : 'ghost'"
        size="icon-sm"
        @click="goTo(p)"
      >
        {{ p }}
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        :disabled="page >= totalPages"
        @click="goTo(page + 1)"
      >
        <ChevronRight />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        :disabled="page >= totalPages"
        @click="goTo(totalPages)"
      >
        <ChevronsRight />
      </Button>
    </div>
  </div>
</template>
