<script setup lang="ts">
import { vMaska } from 'maska/vue'
import { formatDocument, isValidDocument } from '#shared/utils/document'

const props = withDefaults(
  defineProps<{
    modelValue?: string | null
    id?: string
    disabled?: boolean
    placeholder?: string
  }>(),
  {
    modelValue: null,
    id: undefined,
    disabled: false,
    placeholder: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue' | 'error', value: string | null): void
  (e: 'blur'): void
}>()

const display = ref('')

const onlyDigits = (value: string) => value.replace(/\D/g, '')

function digitsToDisplay(value: string | null | undefined): string {
  const digits = onlyDigits(value ?? '')
  return digits ? formatDocument(digits) : ''
}

// Sync the masked field when a digits value arrives from outside (initial/reset),
// but never while it already represents the same digits (avoids clobbering typing).
watch(
  () => props.modelValue,
  () => {
    if (onlyDigits(props.modelValue ?? '') !== onlyDigits(display.value)) {
      display.value = digitsToDisplay(props.modelValue)
    }
  },
  { immediate: true },
)

// Always emit the raw digits (never null-on-invalid) so an invalid document stays
// in form state and the zod schema fails on submit. The error event surfaces
// "Documento inválido." only once the input reaches a full CPF (11) or CNPJ (14)
// length and the check digits don't match; other lengths are treated as incomplete.
watch(display, (value) => {
  const digits = onlyDigits(value)
  emit('update:modelValue', digits || null)
  const complete = digits.length === 11 || digits.length === 14
  emit('error', complete && !isValidDocument(digits) ? 'Documento inválido.' : null)
})
</script>

<template>
  <Input
    :id="id"
    v-model="display"
    v-maska
    :data-maska="['###.###.###-##', '##.###.###/####-##']"
    :placeholder="placeholder"
    inputmode="numeric"
    autocomplete="off"
    :disabled="disabled"
    @blur="emit('blur')"
  />
</template>
