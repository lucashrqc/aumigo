/** Date-range presets for the dashboard filter. */

export interface DateRange {
  from: string
  to: string
}

export type DatePresetId =
  'this-month' | 'last-3-months' | 'last-6-months' | 'last-12-months' | 'year'

export const datePresets: { id: DatePresetId; label: string }[] = [
  { id: 'this-month', label: 'Este mês' },
  { id: 'last-3-months', label: 'Últimos 3 meses' },
  { id: 'last-6-months', label: 'Últimos 6 meses' },
  { id: 'last-12-months', label: 'Últimos 12 meses' },
  { id: 'year', label: 'Ano atual' },
]

const pad = (n: number) => String(n).padStart(2, '0')

/** Local-time `YYYY-MM-DD`. */
export const toIsoDate = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

export function presetRange(id: DatePresetId): DateRange {
  const now = new Date()
  const to = toIsoDate(now)
  switch (id) {
    case 'this-month':
      return {
        from: toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1)),
        to,
      }
    case 'last-3-months':
      return {
        from: toIsoDate(
          new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()),
        ),
        to,
      }
    case 'last-6-months':
      return {
        from: toIsoDate(
          new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()),
        ),
        to,
      }
    case 'last-12-months':
      return {
        from: toIsoDate(
          new Date(now.getFullYear(), now.getMonth() - 12, now.getDate()),
        ),
        to,
      }
    case 'year':
      return { from: toIsoDate(new Date(now.getFullYear(), 0, 1)), to }
  }
}

/** The preset id whose range matches, or null for a custom range. */
export function matchPreset(range: DateRange): DatePresetId | null {
  for (const { id } of datePresets) {
    const r = presetRange(id)
    if (r.from === range.from && r.to === range.to) return id
  }
  return null
}
