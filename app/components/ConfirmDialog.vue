<script setup lang="ts">
import useDialog from '@/composables/useDialog'
import type { Component } from 'vue'

withDefaults(
  defineProps<{
    title?: string
    description?: string
    confirmText?: string
    cancelText?: string
    destructive?: boolean
    icon?: Component
    iconClass?: string
  }>(),
  {
    title: 'Confirmar ação',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    destructive: false,
    iconClass: 'size-5',
  },
)

const { close } = useDialog()
</script>

<template>
  <DialogHeader>
    <DialogTitle class="flex items-center gap-2">
      <component :is="icon" v-if="icon" :class="iconClass" />
      {{ title }}
    </DialogTitle>
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
