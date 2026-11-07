<script setup lang="ts">
import { Label } from '@/components/ui/label'

const props = defineProps<{
  name?: string
  label?: string
  hint?: string
  required?: boolean
  errors?: unknown[]
  touched?: boolean
  orientation?: 'vertical' | 'horizontal'
}>()

const errorText = computed(() => {
  if (props.touched === false) return ''
  const messages = (props.errors ?? [])
    .map((e) => {
      if (!e) return ''
      if (typeof e === 'string') return e
      return (e as { message?: string }).message ?? String(e)
    })
    .filter(Boolean)
  return [...new Set(messages)].join(', ')
})

const invalid = computed(() => Boolean(errorText.value))
</script>

<template>
  <div
    v-if="orientation === 'horizontal'"
    class="grid gap-x-8 gap-y-2 py-5 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] sm:items-center"
  >
    <div class="space-y-1">
      <Label v-if="label" :for="name" class="font-medium">
        {{ label }}<span v-if="required" class="text-destructive"> *</span>
      </Label>
      <p v-if="hint" class="text-xs text-muted-foreground">{{ hint }}</p>
    </div>
    <div class="space-y-1.5 sm:max-w-md">
      <slot :id="name" :invalid="invalid" />
      <p v-if="errorText" class="text-xs text-destructive">{{ errorText }}</p>
    </div>
  </div>

  <div v-else class="space-y-1.5">
    <Label v-if="label" :for="name">
      {{ label }}<span v-if="required" class="text-destructive"> *</span>
    </Label>

    <slot :id="name" :invalid="invalid" />

    <p v-if="errorText" class="text-xs ml-1 text-destructive">
      {{ errorText }}
    </p>
    <p v-else-if="hint" class="text-xs ml-1 text-muted-foreground">
      {{ hint }}
    </p>
  </div>
</template>
