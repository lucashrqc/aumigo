<script setup lang="ts" generic="TData">
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Ellipsis } from '@lucide/vue'
import { computed } from 'vue'

const props = defineProps<{
  row: TData
  actions: RowAction<TData>[]
}>()

const visibleActions = computed(() =>
  props.actions.filter((a) => !a.hidden?.(props.row)),
)
</script>

<template>
  <div class="flex justify-center">
    <div v-if="visibleActions.length <= 2" class="flex gap-1">
      <Button
        v-for="(action, i) in visibleActions"
        :key="i"
        variant="ghost"
        size="icon-sm"
        :class="action.class"
        :aria-label="action.label"
        :title="action.label"
        @click="action.onClick(row)"
      >
        <component
          :is="action.icon"
          v-if="action.icon"
          :class="action.iconClass ?? 'h-4 w-4'"
        />
        <span v-else>{{ action.label }}</span>
      </Button>
    </div>

    <DropdownMenu v-else>
      <DropdownMenuTrigger as-child>
        <Button variant="ghost" class="h-8 w-8 p-0">
          <span class="sr-only">Abrir menu</span>
          <Ellipsis class="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          v-for="(action, i) in visibleActions"
          :key="i"
          :class="action.class"
          @click="action.onClick(row)"
        >
          <component
            :is="action.icon"
            v-if="action.icon"
            :class="action.iconClass ?? 'h-4 w-4'"
          />
          {{ action.label }}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
