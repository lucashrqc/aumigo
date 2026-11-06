<script setup lang="ts">
import { Label } from '@/components/ui/label'

/**
 * Presentational wrapper for a single form control.
 *
 * It owns only the layout around a control — label, error message and hint —
 * and is deliberately agnostic about the control itself: put any input in the
 * default slot (text input, Select, Checkbox, a datepicker, a timepicker, a
 * custom widget). Wire the control to TanStack Form's `<form.Field>` scoped
 * slot and feed this component the field's meta:
 *
 * ```vue
 * <form.Field name="name" v-slot="{ field }">
 *   <FormField
 *     label="Nome"
 *     :name="field.name"
 *     :errors="field.state.meta.errors"
 *     :touched="field.state.meta.isTouched"
 *     required
 *   >
 *     <template #default="{ id, invalid }">
 *       <Input :id="id" :aria-invalid="invalid"
 *         :model-value="field.state.value"
 *         @update:model-value="field.handleChange"
 *         @blur="field.handleBlur" />
 *     </template>
 *   </FormField>
 * </form.Field>
 * ```
 */
const props = defineProps<{
  /** Field name; used as the label's `for` and exposed to the slot as `id`. */
  name?: string
  label?: string
  hint?: string
  required?: boolean
  /**
   * The field's errors — `field.state.meta.errors`. With a Standard Schema
   * validator (Zod) these are issue objects `{ message }`; plain strings are
   * also accepted.
   */
  errors?: unknown[]
  /** Only show errors once the field has been touched, to avoid noise. */
  touched?: boolean
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
  <div class="space-y-1.5">
    <Label v-if="label" :for="name">
      {{ label }}<span v-if="required" class="text-destructive"> *</span>
    </Label>

    <slot :id="name" :invalid="invalid" />

    <p v-if="errorText" class="text-xs ml-1 text-destructive">{{ errorText }}</p>
    <p v-else-if="hint" class="text-xs ml-1 text-muted-foreground">{{ hint }}</p>
  </div>
</template>
