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

/** pt-BR age label derived from a birth date, or `null` when empty/invalid. */
export const petAgeLabel = (
  value: string | Date | null | undefined,
): string | null => {
  const birth = toDate(value)
  if (!birth) return null

  const now = new Date()
  let months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth())
  if (now.getDate() < birth.getDate()) months--

  if (months < 1) return 'Menos de 1 mês'
  if (months < 12) return `${months} ${months === 1 ? 'mês' : 'meses'}`

  const years = Math.floor(months / 12)
  return `${years} ${years === 1 ? 'ano' : 'anos'}`
}
