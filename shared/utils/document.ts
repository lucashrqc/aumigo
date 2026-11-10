/** Validate and format Brazilian documents (CPF for individuals, CNPJ for companies). */

const onlyDigits = (value: string): string => value.replace(/\D/g, '')

const allSameDigit = (digits: string): boolean => /^(\d)\1*$/.test(digits)

/**
 * Compute a single check digit from a slice of `digits` using positional
 * `weights`. The remainder rule shared by CPF and CNPJ: `mod < 2 ? 0 : 11 - mod`.
 */
const checkDigit = (digits: string, weights: number[]): number => {
  const sum = weights.reduce((acc, weight, i) => acc + Number(digits[i]) * weight, 0)
  const mod = sum % 11
  return mod < 2 ? 0 : 11 - mod
}

/** Strip every non-digit, yielding the canonical stored form of a document. */
export const documentDigits = (value: string | null | undefined): string =>
  onlyDigits(value ?? '')

/**
 * Validate a CPF. Accepts masked or unmasked input; returns `true` only for an
 * 11-digit number with matching check digits. Sequences of one repeated digit
 * (e.g. `00000000000`) are rejected even though they satisfy the raw algorithm.
 */
export const isValidCpf = (value: string): boolean => {
  const digits = onlyDigits(value)
  if (digits.length !== 11 || allSameDigit(digits)) return false
  const first = checkDigit(digits, [10, 9, 8, 7, 6, 5, 4, 3, 2])
  const second = checkDigit(digits, [11, 10, 9, 8, 7, 6, 5, 4, 3, 2])
  return first === Number(digits[9]) && second === Number(digits[10])
}

/**
 * Validate a CNPJ. Accepts masked or unmasked input; returns `true` only for a
 * 14-digit number with matching check digits. Sequences of one repeated digit
 * are rejected even though they satisfy the raw algorithm.
 */
export const isValidCnpj = (value: string): boolean => {
  const digits = onlyDigits(value)
  if (digits.length !== 14 || allSameDigit(digits)) return false
  const firstWeights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const first = checkDigit(digits, firstWeights)
  const second = checkDigit(digits, [6, ...firstWeights])
  return first === Number(digits[12]) && second === Number(digits[13])
}

/**
 * Validate a document by dispatching on its digit count: 11 digits is checked as
 * a CPF, 14 as a CNPJ, and any other length is invalid.
 */
export const isValidDocument = (value: string): boolean => {
  const digits = onlyDigits(value)
  if (digits.length === 11) return isValidCpf(digits)
  if (digits.length === 14) return isValidCnpj(digits)
  return false
}

/**
 * Format a stored document for display: 11 digits as a CPF (`000.000.000-00`),
 * 14 as a CNPJ (`00.000.000/0000-00`). Empty input yields an em dash; any other
 * length is returned as its bare digits.
 */
export const formatDocument = (value: string | null | undefined): string => {
  const digits = onlyDigits(value ?? '')
  if (!digits) return '—'
  if (digits.length === 11)
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  if (digits.length === 14)
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  return digits
}
