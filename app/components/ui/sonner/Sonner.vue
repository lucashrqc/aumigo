<script setup lang="ts">
import { Toaster as Sonner, type ToasterProps } from 'vue-sonner'
import 'vue-sonner/style.css'

const colorMode = useColorMode()
const props = defineProps<ToasterProps>()
</script>

<template>
  <Sonner
    class="toaster group"
    v-bind="{ ...props, theme: (colorMode.value as ToasterProps['theme']) }"
  />
</template>
