<script setup lang="ts">
import { computed } from 'vue'
import { Moon, Sun } from '@lucide/vue'
import { Switch } from '@/components/ui/switch'

const colorMode = useColorMode()

const isDark = computed({
  get: () => colorMode.value === 'dark',
  set: (value) => {
    colorMode.preference = value ? 'dark' : 'light'
  },
})
</script>

<template>
  <ClientOnly>
    <Switch
      v-model="isDark"
      :aria-label="isDark ? 'Ativar tema claro' : 'Ativar tema escuro'"
    >
      <template #thumb>
        <span class="flex size-full items-center justify-center">
          <Moon v-if="isDark" class="size-3 text-slate-700" />
          <Sun v-else class="size-3 text-amber-500" />
        </span>
      </template>
    </Switch>

    <template #fallback>
      <Switch disabled aria-hidden="true">
        <template #thumb>
          <span class="flex size-full items-center justify-center">
            <Sun class="size-3 text-amber-500" />
          </span>
        </template>
      </Switch>
    </template>
  </ClientOnly>
</template>
