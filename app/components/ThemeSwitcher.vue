<script setup lang="ts">
import { Moon, Sun } from '@lucide/vue'

const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === 'dark')

function setDark(value: boolean) {
  colorMode.preference = value ? 'dark' : 'light'
}

// Dependencies for the commented reference implementation below:
// import { Monitor } from '@lucide/vue'
// import { cn } from 'cn'
// const options = [
//   { value: 'system', label: 'Tema do sistema', icon: Monitor },
//   { value: 'light', label: 'Tema claro', icon: Sun },
//   { value: 'dark', label: 'Tema escuro', icon: Moon },
// ] as const
</script>

<template>
  <ClientOnly>
    <!-- <div
      role="radiogroup"
      aria-label="Alternar tema"
      class="dark:bg-muted bg-sage-line inline-flex items-center gap-0.5 rounded-full p-1"
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
    </template> -->

    <Switch
      :model-value="isDark"
      aria-label="Alternar tema"
      class="data-[state=unchecked]:bg-sage-line"
      @update:model-value="setDark"
    >
      <template #thumb>
        <span
          class="bg-background text-foreground flex size-full items-center justify-center rounded-full"
        >
          <Moon v-if="isDark" class="size-2.5" />
          <Sun v-else class="size-2.5" />
        </span>
      </template>
    </Switch>

    <template #fallback>
      <div class="bg-muted h-[1.15rem] w-8 rounded-full" />
    </template>
  </ClientOnly>
</template>
