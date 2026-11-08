export type DeepPartial<T> = T extends (infer U)[]
  ? DeepPartial<U>[]
  : T extends object
    ? { [P in keyof T]?: DeepPartial<T[P]> }
    : T

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
