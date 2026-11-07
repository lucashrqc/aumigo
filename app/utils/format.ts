/** Date/value formatting helpers for the UI. */

const pad = (n: number) => String(n).padStart(2, '0')

const toDate = (value: string | Date | null | undefined): Date | null => {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/** Format a date as `dd/mm/YYYY HH:MM:ss` in local time, or `—` when empty/invalid. */
export const formatDateTime = (value: string | Date | null | undefined): string => {
  const date = toDate(value)
  if (!date) return '—'
  return (
    `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  )
}

/** Format a date as `dd/mm/YYYY` in local time, or `—` when empty/invalid. */
export const formatDate = (value: string | Date | null | undefined): string => {
  const date = toDate(value)
  if (!date) return '—'
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`
}
