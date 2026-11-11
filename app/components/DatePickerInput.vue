<script setup lang="ts">
import {
  getLocalTimeZone,
  parseDate,
  today,
  type DateValue,
} from '@internationalized/date'
import { CalendarDays } from '@lucide/vue'
import { vMaska } from 'maska/vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string | null
    id?: string
    disabled?: boolean
    placeholder?: string
    min?: string
    max?: string
  }>(),
  {
    modelValue: null,
    id: undefined,
    disabled: false,
    placeholder: undefined,
    min: undefined,
    max: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue' | 'error', value: string | null): void
  (e: 'blur'): void
}>()

const open = ref(false)
const display = ref('')

/**
 * Parse the masked display ('dd/mm/yyyy') into a valid ISO string, else null.
 *
 * Validation is delegated to `@internationalized/date`'s `parseDate`, which
 * rejects impossible calendar dates — out-of-range months/days and invalid
 * leap days (e.g. 29/02 on a non-leap year) — so no hand-rolled check is needed.
 */
function displayToIso(value: string): string | null {
  const digits = value.replace(/\D/g, '')
  if (digits.length !== 8) return null
  const iso = `${digits.slice(4, 8)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`
  try {
    parseDate(iso)
  } catch {
    return null
  }
  if (props.min && iso < props.min) return null
  if (props.max && iso > props.max) return null
  return iso
}

/** Format an ISO string ('YYYY-MM-DD') into 'dd/mm/yyyy', else ''. */
function isoToDisplay(iso: string | null | undefined): string {
  if (!iso) return ''
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return ''
  const [, y, m, d] = match
  return `${d}/${m}/${y}`
}

// Sync the masked field when an ISO value arrives from outside (initial/reset),
// but never while it already represents the same date (avoids clobbering typing).
watch(
  () => props.modelValue,
  () => {
    if ((props.modelValue || null) !== displayToIso(display.value)) {
      display.value = isoToDisplay(props.modelValue)
    }
  },
  { immediate: true },
)

// Emit ISO (or null) as the user edits. null covers incomplete + invalid dates.
// When the field is fully typed (8 digits) but not a real date, surface an error
// so the parent can set it on the form field; clear it otherwise.
watch(display, (value) => {
  const iso = displayToIso(value)
  if (iso !== (props.modelValue || null)) emit('update:modelValue', iso)
  const complete = value.replace(/\D/g, '').length === 8
  emit('error', iso === null && complete ? 'Data inválida.' : null)
})

const calendarValue = computed<DateValue | undefined>(() => {
  const iso = displayToIso(display.value)
  return iso ? parseDate(iso) : undefined
})

const minValue = computed<DateValue | undefined>(() =>
  props.min ? parseDate(props.min) : undefined,
)
const maxValue = computed<DateValue | undefined>(() =>
  props.max ? parseDate(props.max) : undefined,
)

function onSelect(value: DateValue | undefined) {
  if (!value) return
  const iso = value.toString()
  display.value = isoToDisplay(iso)
  emit('update:modelValue', iso)
  open.value = false
}

function selectToday() {
  onSelect(today(getLocalTimeZone()))
}
</script>

<template>
  <Popover v-model:open="open">
    <InputGroup>
      <InputGroupInput
        :id="id"
        v-model="display"
        v-maska
        data-maska="##/##/####"
        :placeholder="placeholder"
        inputmode="numeric"
        autocomplete="off"
        :disabled="disabled"
        @blur="emit('blur')"
      />
      <InputGroupAddon align="inline-end">
        <PopoverTrigger as-child>
          <InputGroupButton
            type="button"
            size="icon-xs"
            :disabled="disabled"
            aria-label="Abrir calendário"
          >
            <CalendarDays class="size-4" />
          </InputGroupButton>
        </PopoverTrigger>
      </InputGroupAddon>
    </InputGroup>

    <PopoverContent class="w-auto p-0" align="end">
      <Calendar
        locale="pt-BR"
        :model-value="calendarValue"
        :min-value="minValue"
        :max-value="maxValue"
        @update:model-value="onSelect"
      />
      <div class="border-t p-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          class="w-full"
          @click="selectToday"
        >
          Hoje
        </Button>
      </div>
    </PopoverContent>
  </Popover>
</template>
