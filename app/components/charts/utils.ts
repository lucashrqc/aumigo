import type { DatasetComponentOption } from 'echarts'

export type DeepPartial<T> = T extends (infer U)[]
  ? DeepPartial<U>[]
  : T extends object
    ? { [P in keyof T]?: DeepPartial<T[P]> }
    : T

function isMeaningfulNumber(value: unknown): boolean {
  return typeof value === 'number' && Number.isFinite(value) && value !== 0
}

function rowHasValue(row: unknown): boolean {
  if (Array.isArray(row))
    return row.some(isMeaningfulNumber)
  if (row && typeof row === 'object')
    return Object.values(row).some(isMeaningfulNumber)
  return isMeaningfulNumber(row)
}

export function hasChartData(
  dataset: DatasetComponentOption['source'] | undefined,
  options?: Record<string, any>,
): boolean {
  if (Array.isArray(dataset)) {
    const rows = dataset as unknown[]
    const dataRows = rows.every((row) => Array.isArray(row))
      ? rows.slice(1)
      : rows
    if (dataRows.some(rowHasValue))
      return true
  }

  const series = options?.series
  if (series) {
    const list = Array.isArray(series) ? series : [series]
    if (list.some((s) => Array.isArray(s?.data) && s.data.some(rowHasValue)))
      return true
  }

  return false
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function deepMerge<T extends Record<string, any>>(
  base: T,
  override?: Record<string, any>,
): T {
  if (!override)
    return base

  const out: Record<string, any> = { ...base }
  for (const key of Object.keys(override)) {
    const next = override[key]
    const prev = out[key]
    out[key]
      = isPlainObject(next) && isPlainObject(prev)
        ? deepMerge(prev, next)
        : next
  }
  return out as T
}

export function withDefaultSeriesType<T extends Record<string, any>>(
  option: T,
  type: 'line' | 'bar' | 'pie',
): T {
  if (!option.series)
    return option

  const list = Array.isArray(option.series) ? option.series : [option.series]
  return {
    ...option,
    series: list.map((series: Record<string, any>) => ({
      type,
      emphasis: { disabled: true },
      ...series,
    })),
  }
}
