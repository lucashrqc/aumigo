/** Date/value formatting helpers for the UI. */

const pad = (n: number) => String(n).padStart(2, '0')

const onlyDigits = (value: string) => value.replace(/\D/g, '')

/** Format a BR phone for display: 10 digits as (XX) XXXX-XXXX, 11 as (XX) XXXXX-XXXX. */
export const formatPhone = (value: string | null | undefined): string => {
  const digits = onlyDigits(value ?? '')
  if (digits.length === 10)
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  if (digits.length === 11)
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  return value?.trim() || '—'
}

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
  // A date-only ISO string ('YYYY-MM-DD') is a calendar date, not an instant:
  // parsing it via `new Date` treats it as UTC midnight and can shift the day
  // in negative-offset timezones, so format it from its parts directly.
  if (typeof value === 'string') {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
    if (match) {
      const [, y, m, d] = match
      return `${d}/${m}/${y}`
    }
  }
  const date = toDate(value)
  if (!date) return '—'
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`
}

const monthsBetween = (from: Date, to: Date): number => {
  let months =
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth())
  if (to.getDate() < from.getDate()) months--
  return months
}

const durationLabel = (months: number): string => {
  if (months < 1) return 'Menos de 1 mês'
  if (months < 12) return `${months} ${months === 1 ? 'mês' : 'meses'}`
  const years = Math.floor(months / 12)
  return `${years} ${years === 1 ? 'ano' : 'anos'}`
}

/** pt-BR age label derived from a birth date, or `null` when empty/invalid. */
export const petAgeLabel = (
  value: string | Date | null | undefined,
): string | null => {
  const birth = toDate(value)
  return birth ? durationLabel(monthsBetween(birth, new Date())) : null
}

/**
 * pt-BR "time in adoption" label from a start date (e.g. `publishedAt`): `Novo pet`
 * under a day, then days / months / years, each suffixed `em adoção`. `null` when empty.
 */
export const petTimeInAdoptionLabel = (
  value: string | Date | null | undefined,
): string | null => {
  const since = toDate(value)
  if (!since) return null

  const now = new Date()
  const months = monthsBetween(since, now)
  if (months >= 12) {
    const years = Math.floor(months / 12)
    return `${years} ${years === 1 ? 'ano' : 'anos'} em adoção`
  }
  if (months >= 1) return `${months} ${months === 1 ? 'mês' : 'meses'} em adoção`

  const days = Math.floor((now.getTime() - since.getTime()) / 86_400_000)
  if (days < 1) return 'Novo pet'
  return `${days} ${days === 1 ? 'dia' : 'dias'} em adoção`
}
