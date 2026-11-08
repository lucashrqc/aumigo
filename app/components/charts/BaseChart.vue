<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import type { HTMLAttributes } from 'vue'
import VChart from 'vue-echarts'

const props = defineProps<{
  option: EChartsOption
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div :class="props.class">
    <ClientOnly>
      <VChart
        :option="option"
        :autoresize="{ throttle: 100 }"
        :style="{ width: '100%', height: '100%', fontFamily: 'var(--font-sans)' }"
      />
    </ClientOnly>
  </div>
</template>
