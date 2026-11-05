<script setup lang="ts">
const props = defineProps<{ page: number; pageSize: number; total: number }>()
const emit = defineEmits<{ (e: 'update:page', page: number): void }>()

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
</script>

<template>
  <div v-if="totalPages > 1" class="flex items-center justify-center gap-4">
    <Button variant="outline" size="sm" :disabled="page <= 1" @click="emit('update:page', page - 1)">
      Previous
    </Button>
    <span class="text-sm text-muted-foreground">Page {{ page }} of {{ totalPages }}</span>
    <Button
      variant="outline"
      size="sm"
      :disabled="page >= totalPages"
      @click="emit('update:page', page + 1)"
    >
      Next
    </Button>
  </div>
</template>
