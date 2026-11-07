<script setup lang="ts">
import useDialog from '@/composables/useDialog'

withDefaults(
  defineProps<{
    title?: string
    description?: string
    confirmText?: string
    cancelText?: string
    destructive?: boolean
  }>(),
  {
    title: 'Confirmar ação',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    destructive: false,
  },
)

const { close } = useDialog()
</script>

<template>
  <DialogHeader>
    <DialogTitle>{{ title }}</DialogTitle>
    <DialogDescription v-if="description">{{ description }}</DialogDescription>
  </DialogHeader>
  <DialogFooter>
    <Button variant="outline" @click="close(false)">{{ cancelText }}</Button>
    <Button
      :variant="destructive ? 'destructive' : 'default'"
      @click="close(true)"
    >
      {{ confirmText }}
    </Button>
  </DialogFooter>
</template>
