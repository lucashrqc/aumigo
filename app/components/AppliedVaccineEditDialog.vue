<script setup lang="ts">
import AppliedVaccineForm from '@/components/AppliedVaccineForm.vue'
import type { AppliedVaccineFieldsInput } from '#shared/schemas'

withDefaults(
  defineProps<{ initial?: AppliedVaccineDto | null; submitting?: boolean }>(),
  { initial: null, submitting: false },
)

// `resolve` is wired by AppDialogHost to close the dialog with this value, so
// the awaited `dialog.open(...)` receives the edited payload (dismiss → undefined).
const emit = defineEmits<{
  (e: 'resolve', payload: AppliedVaccineFieldsInput): void
}>()
</script>

<template>
  <AppliedVaccineForm
    :initial="initial"
    :submitting="submitting"
    submit-label="Salvar"
    @submit="emit('resolve', $event)"
  />
</template>
