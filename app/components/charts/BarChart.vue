<script setup lang="ts">
import type { DatasetComponentOption, EChartsOption } from 'echarts'
import type { HTMLAttributes } from 'vue'
import type { DeepPartial } from './utils'
import BaseChart from './BaseChart.vue'
import { deepMerge, withDefaultSeriesType } from './utils'

const props = defineProps<{
  dataset?: DatasetComponentOption['source']
  options?: DeepPartial<EChartsOption>
  class?: HTMLAttributes['class']
}>()

const theme = useChartTheme()

const option = computed<EChartsOption>(() => {
  const base: EChartsOption = {
    color: theme.value.palette,
    textStyle: { color: theme.value.text },
    grid: { left: 8, right: 16, top: 24, bottom: 32, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: theme.value.tooltipBg,
      borderColor: theme.value.tooltipBorder,
      textStyle: { color: theme.value.tooltipText },
    },
    legend: {
      bottom: 0,
      icon: 'roundRect',
      textStyle: { color: theme.value.text },
    },
    xAxis: {
      type: 'category',
      axisLine: { lineStyle: { color: theme.value.axis } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { color: theme.value.text },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: theme.value.text },
      splitLine: { lineStyle: { color: theme.value.splitLine } },
    },
    ...(props.dataset ? { dataset: { source: props.dataset } } : {}),
  }

  const merged = withDefaultSeriesType(deepMerge(base, props.options), 'bar')

  if (merged.series) {
    const list = Array.isArray(merged.series) ? merged.series : [merged.series]
    merged.series = list.map((series) => ({
      barMaxWidth: 48,
      itemStyle: { borderRadius: [6, 6, 0, 0] },
      ...series,
    }))
  }

  return merged
})
</script>

<template>
  <BaseChart :option="option" :class="props.class" />
</template>
