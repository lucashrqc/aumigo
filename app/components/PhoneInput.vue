<script setup lang="ts">
import { vMaska } from 'maska/vue'
import type { HTMLAttributes } from 'vue'

withDefaults(
  defineProps<{
    modelValue?: string | null
    id?: string
    disabled?: boolean
    placeholder?: string
    class?: HTMLAttributes['class']
  }>(),
  {
    modelValue: null,
    id: undefined,
    disabled: false,
    placeholder: '(11) 99999-9999',
    class: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'blur'): void
}>()

function onMaska(detail: { unmasked: string }) {
  emit('update:modelValue', detail.unmasked)
}
</script>

<template>
  <Input
    :id="id"
    v-maska
    data-maska="['(##) #####-####', '(##) ####-####']"
    :default-value="modelValue ?? ''"
    :placeholder="placeholder"
    :disabled="disabled"
    :class="$props.class"
    inputmode="numeric"
    autocomplete="tel"
    @blur="emit('blur')"
    @on-maska="onMaska"
  />
</template>
