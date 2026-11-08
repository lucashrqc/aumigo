<script setup lang="ts">
import { CalendarDays } from '@lucide/vue'
import {
  datePresets,
  matchPreset,
  presetRange,
  type DatePresetId,
  type DateRange,
} from '@/utils/date-range'
import { formatDate } from '@/utils/format'

const model = defineModel<DateRange>({ required: true })

const open = ref(false)

const activePreset = computed<DatePresetId | null>(() =>
  matchPreset(model.value),
)

const label = computed(() => {
  const preset = datePresets.find((p) => p.id === activePreset.value)
  if (preset) return preset.label
  return `${formatDate(model.value.from)} – ${formatDate(model.value.to)}`
})

function setPreset(id: DatePresetId) {
  model.value = presetRange(id)
  open.value = false
}

const fromValue = computed({
  get: () => model.value.from,
  set: (value: string | null) => {
    if (value) model.value = { ...model.value, from: value }
  },
})

const toValue = computed({
  get: () => model.value.to,
  set: (value: string | null) => {
    if (value) model.value = { ...model.value, to: value }
  },
})
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button variant="outline" class="justify-start gap-2 font-normal">
        <CalendarDays class="size-4" />
        <span>{{ label }}</span>
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-72 p-3" align="start">
      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1">
          <Button
            v-for="preset in datePresets"
            :key="preset.id"
            :variant="activePreset === preset.id ? 'default' : 'ghost'"
            size="sm"
            class="justify-start whitespace-nowrap"
            @click="setPreset(preset.id)"
          >
            {{ preset.label }}
          </Button>
        </div>
        <div class="grid gap-2 border-t pt-3">
          <div class="grid gap-1.5">
            <Label class="text-muted-foreground text-xs">De</Label>
            <DatePickerInput
              v-model="fromValue"
              :max="model.to"
              placeholder="dd/mm/aaaa"
            />
          </div>
          <div class="grid gap-1.5">
            <Label class="text-muted-foreground text-xs">Até</Label>
            <DatePickerInput
              v-model="toValue"
              :min="model.from"
              placeholder="dd/mm/aaaa"
            />
          </div>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
