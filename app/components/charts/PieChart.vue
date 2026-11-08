<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import type { HTMLAttributes } from 'vue'
import type { DeepPartial } from './utils'
import BaseChart from './BaseChart.vue'
import { deepMerge, withDefaultSeriesType } from './utils'

const props = defineProps<{
  dataset?: unknown[]
  options?: DeepPartial<EChartsOption>
  class?: HTMLAttributes['class']
}>()

const theme = useChartTheme()

const option = computed<EChartsOption>(() => {
  const base: EChartsOption = {
    color: theme.value.palette,
    textStyle: { color: theme.value.text },
    tooltip: {
      trigger: 'item',
      backgroundColor: theme.value.tooltipBg,
      borderColor: theme.value.tooltipBorder,
      textStyle: { color: theme.value.tooltipText },
    },
    legend: { bottom: 0, icon: 'circle', textStyle: { color: theme.value.text } },
    ...(props.dataset ? { dataset: { source: props.dataset } } : {}),
  }

  const withTypedSeries = withDefaultSeriesType(deepMerge(base, props.options), 'pie')
  const list = Array.isArray(withTypedSeries.series)
    ? withTypedSeries.series
    : withTypedSeries.series
      ? [withTypedSeries.series]
      : []

  return {
    ...withTypedSeries,
    series: list.map((series: Record<string, any>) => ({
      radius: ['45%', '70%'],
      itemStyle: { borderColor: theme.value.tooltipBg, borderWidth: 2 },
      label: { color: theme.value.text },
      ...series,
    })),
  }
})
</script>

<template>
  <BaseChart :option="option" :class="props.class" />
</template>
