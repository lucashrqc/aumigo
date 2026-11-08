<script setup lang="ts">
import { Monitor, Moon, Sun } from '@lucide/vue'
import { cn } from 'cn'

const colorMode = useColorMode()

const options = [
  { value: 'system', label: 'Tema do sistema', icon: Monitor },
  { value: 'light', label: 'Tema claro', icon: Sun },
  { value: 'dark', label: 'Tema escuro', icon: Moon },
] as const
</script>

<template>
  <ClientOnly>
    <div
      role="radiogroup"
      aria-label="Alternar tema"
      class="bg-brand dark:bg-muted inline-flex items-center gap-0.5 rounded-full p-1"
    >
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        role="radio"
        :aria-checked="colorMode.preference === option.value"
        :aria-label="option.label"
        :title="option.label"
        :class="
          cn(
            'focus-visible:ring-ring flex size-5 items-center justify-center rounded-full transition-colors outline-none focus-visible:ring-2',
            colorMode.preference === option.value
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground',
          )
        "
        @click="colorMode.preference = option.value"
      >
        <component :is="option.icon" class="size-3" />
      </button>
    </div>

    <template #fallback>
      <div class="bg-muted inline-flex items-center gap-0.5 rounded-full p-1">
        <span class="flex size-5 items-center justify-center rounded-full">
          <Monitor class="text-muted-foreground size-3" />
        </span>
        <span class="flex size-5 items-center justify-center rounded-full">
          <Sun class="text-muted-foreground size-3" />
        </span>
        <span class="flex size-5 items-center justify-center rounded-full">
          <Moon class="text-muted-foreground size-3" />
        </span>
      </div>
    </template>
  </ClientOnly>
</template>
