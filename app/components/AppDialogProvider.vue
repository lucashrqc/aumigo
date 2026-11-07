<script setup lang="ts">
import useDialog from '@/composables/useDialog'

const { stack, closeAll } = useDialog()

// Dismiss anything still open when the route changes (prevents leaked pending
// promises and dialogs lingering over the next page).
useRouter().afterEach(() => closeAll())
</script>

<template>
  <AppDialogHost
    v-for="[id, entry] in stack"
    :key="id"
    :entry="entry"
  />
</template>
