<script setup lang="ts" generic="T">
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/**
 * Thin, synchronous wrapper around the Select primitives.
 *
 * It removes the Select/SelectTrigger/SelectContent/SelectItem boilerplate: give
 * it an `options` array plus the keys to read as the label and the value.
 *
 * ```vue
 * <SelectOptions
 *   v-model="speciesId"
 *   :options="species"
 *   option-label="name"
 *   option-value="id"
 *   placeholder="Selecione a espécie"
 * />
 * ```
 *
 * For static lists, use the default `{ label, value }` shape:
 * `:options="[{ label: 'Disponível', value: 'available' }]"`.
 */
const props = withDefaults(
  defineProps<{
    options: T[]
    /** Key of each option to render as the visible text. Defaults to `label`. */
    optionLabel?: string
    /** Key of each option to use as the selected value. Defaults to `value`. */
    optionValue?: string
    placeholder?: string
    disabled?: boolean
  }>(),
  { optionLabel: 'label', optionValue: 'value', placeholder: undefined, disabled: false },
)

const model = defineModel<string | number | null>()

const items = computed(() =>
  props.options.map((option) => {
    const record = option as Record<string, unknown>
    return {
      label: record[props.optionLabel] as string,
      value: record[props.optionValue] as string | number,
    }
  }),
)
</script>

<template>
  <Select v-model="model" :disabled="disabled">
    <SelectTrigger class="w-full"><SelectValue :placeholder="placeholder" /></SelectTrigger>
    <SelectContent>
      <SelectItem v-for="item in items" :key="String(item.value)" :value="item.value">
        {{ item.label }}
      </SelectItem>
    </SelectContent>
  </Select>
</template>
