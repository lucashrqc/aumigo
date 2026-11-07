<script setup lang="ts">
const props = defineProps<{ page: number; pageSize: number; total: number }>()
const emit = defineEmits<{ (e: 'update:page', page: number): void }>()

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
</script>

<template>
  <div v-if="totalPages > 1" class="flex items-center justify-end gap-4">
    <Button variant="outline" size="sm" :disabled="page <= 1" @click="emit('update:page', page - 1)">
      Anterior
    </Button>
    <span class="text-sm text-muted-foreground">Página {{ page }} de {{ totalPages }}</span>
    <Button
      variant="outline"
      size="sm"
      :disabled="page >= totalPages"
      @click="emit('update:page', page + 1)"
    >
      Próxima
    </Button>
  </div>
</template>
