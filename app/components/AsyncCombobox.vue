<script setup lang="ts" generic="T">
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  CheckIcon,
  ChevronsUpDownIcon,
  Loader2Icon,
  Plus,
  Search,
  XIcon,
} from '@lucide/vue'
import { useDebounceFn, useInfiniteScroll } from '@vueuse/core'
import { cn } from 'cn'
import type { ComponentPublicInstance } from 'vue'
import { computed, reactive, ref, watch } from 'vue'

/**
 * Generic, presentational async combobox for searchable/paginated lists.
 * Pair with `useInfiniteOptions`: it emits `search` / `can-load-more` / `on-add` and keeps the
 * selected label visible via an internal registry (seeded by `initial-option` or `resolve-by-id`).
 */
const props = withDefaults(
  defineProps<{
    items: T[]
    isFetching?: boolean
    isFetchingNextPage?: boolean
    hasNextPage?: boolean
    optionValue?: string
    optionLabel?: string
    placeholder?: string
    searchPlaceholder?: string
    resolveById?: (id: string) => Promise<T | null | undefined>
    initialOption?: { value: string; label: string }
    canAdd?: boolean
    addLabel?: string
    minSearchLength?: number
    debounceMs?: number
    disabled?: boolean
    clearable?: boolean
  }>(),
  {
    isFetching: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    optionValue: 'value',
    optionLabel: 'label',
    placeholder: 'Selecionar…',
    searchPlaceholder: 'Buscar…',
    resolveById: undefined,
    initialOption: undefined,
    canAdd: false,
    addLabel: 'Adicionar registro',
    minSearchLength: 2,
    debounceMs: 400,
    disabled: false,
    clearable: false,
  },
)

const emit = defineEmits<{
  search: [value: string]
  'can-load-more': []
  'on-add': []
}>()

const model = defineModel<string | null>()

const open = ref(false)
const rawSearch = ref('')

const valueOf = (option: T) =>
  String((option as Record<string, unknown>)[props.optionValue])
const labelOf = (option: T) =>
  String((option as Record<string, unknown>)[props.optionLabel])

// Registry of seen/selected labels, so the trigger keeps its text after the search is cleared.
const registry = reactive(new Map<string, string>())

watch(
  () => props.items,
  (items) =>
    items.forEach((option) => registry.set(valueOf(option), labelOf(option))),
  { immediate: true, deep: true },
)

// Recover the selected label when the model holds an id not in the loaded pages (edit flows).
watch(
  model,
  async (id) => {
    if (!id || registry.has(id)) return
    if (props.initialOption?.value === id) {
      registry.set(id, props.initialOption.label)
      return
    }
    if (props.resolveById) {
      const record = await props.resolveById(id)
      if (record && model.value === id)
        registry.set(valueOf(record), labelOf(record))
    }
  },
  { immediate: true },
)

const triggerLabel = computed(() => {
  if (!model.value) return props.placeholder
  return registry.get(model.value) ?? props.initialOption?.label ?? model.value
})

const emitSearch = useDebounceFn((value: string) => {
  emit('search', value.length >= props.minSearchLength ? value : '')
}, props.debounceMs)

watch(rawSearch, (value) => emitSearch(value))

// Infinite scroll; `canLoadMore` prevents duplicate page requests.
const listRef = ref<ComponentPublicInstance | null>(null)
const listEl = computed(
  () => (listRef.value?.$el as HTMLElement | undefined) ?? undefined,
)

useInfiniteScroll(listEl, () => emit('can-load-more'), {
  distance: 20,
  canLoadMore: () =>
    props.hasNextPage && !props.isFetching && !props.isFetchingNextPage,
})

function select(option: T) {
  const value = valueOf(option)
  model.value = model.value === value ? null : value
  registry.set(value, labelOf(option))
  open.value = false
}

function clear() {
  model.value = null
}

const showEmpty = computed(() => !props.isFetching && props.items.length === 0)
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        role="combobox"
        :aria-expanded="open"
        :disabled="disabled"
        class="w-full justify-between font-normal hover:bg-background hover:text-foreground"
      >
        <span :class="cn('truncate', !model && 'text-muted-foreground')">{{
          triggerLabel
        }}</span>
        <span
          v-if="clearable && model && !disabled"
          role="button"
          aria-label="Limpar seleção"
          class="ml-2 shrink-0 opacity-50 hover:opacity-100"
          @pointerdown.stop.prevent
          @click.stop.prevent="clear"
        >
          <XIcon class="h-4 w-4" />
        </span>
        <ChevronsUpDownIcon v-else class="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent
      class="w-(--reka-popover-trigger-width) min-w-48 p-0"
      align="start"
    >
      <Command>
        <!-- No CommandInput: it writes to the built-in filter, which would hide server results. -->
        <div class="flex h-9 items-center gap-2 border-b px-3">
          <Search class="size-4 shrink-0 opacity-50" />
          <input
            v-model="rawSearch"
            :placeholder="searchPlaceholder"
            class="placeholder:text-muted-foreground flex h-10 w-full bg-transparent py-3 text-sm outline-hidden"
          >
        </div>
        <CommandList ref="listRef">
          <div
            v-if="isFetching && !items.length"
            class="flex justify-center py-6"
          >
            <Loader2Icon class="size-4 animate-spin opacity-50" />
          </div>
          <div
            v-else-if="showEmpty"
            class="py-6 text-center text-sm text-muted-foreground"
          >
            Nenhum registro encontrado.
          </div>
          <CommandGroup>
            <CommandItem
              v-for="option in items"
              :key="valueOf(option)"
              :value="valueOf(option)"
              @select="select(option)"
            >
              <CheckIcon
                :class="
                  cn(
                    'mr-2 h-4 w-4',
                    model === valueOf(option) ? 'opacity-100' : 'opacity-0',
                  )
                "
              />
              {{ labelOf(option) }}
            </CommandItem>
          </CommandGroup>
          <div v-if="isFetchingNextPage" class="flex justify-center py-2">
            <Loader2Icon class="size-4 animate-spin opacity-50" />
          </div>
        </CommandList>
        <template v-if="canAdd">
          <CommandSeparator />
          <button
            type="button"
            class="hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 px-3 py-2 text-left text-sm"
            @click="emit('on-add')"
          >
            <Plus class="size-4" />
            {{ addLabel }}
          </button>
        </template>
      </Command>
    </PopoverContent>
  </Popover>
</template>
