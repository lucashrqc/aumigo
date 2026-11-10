import { describe, expect, it } from 'vitest'
import {
  documentDigits,
  formatDocument,
  isValidCnpj,
  isValidCpf,
  isValidDocument,
} from '../../shared/utils/document'

describe('isValidCpf', () => {
  it('accepts valid unmasked CPFs', () => {
    expect(isValidCpf('52998224725')).toBe(true)
    expect(isValidCpf('11144477735')).toBe(true)
  })

  it('accepts a valid masked CPF', () => {
    expect(isValidCpf('529.982.247-25')).toBe(true)
  })

  it('rejects a CPF with a wrong check digit', () => {
    expect(isValidCpf('52998224724')).toBe(false)
  })

  it('rejects CPFs made of a single repeated digit', () => {
    expect(isValidCpf('00000000000')).toBe(false)
    expect(isValidCpf('11111111111')).toBe(false)
  })

  it('rejects CPFs of the wrong length', () => {
    expect(isValidCpf('5299822472')).toBe(false)
    expect(isValidCpf('529982247250')).toBe(false)
  })

  it('rejects empty and non-digit input', () => {
    expect(isValidCpf('')).toBe(false)
    expect(isValidCpf('abcdefghijk')).toBe(false)
  })
})

describe('isValidCnpj', () => {
  it('accepts a valid unmasked CNPJ', () => {
    expect(isValidCnpj('11222333000181')).toBe(true)
  })

  it('accepts a valid masked CNPJ', () => {
    expect(isValidCnpj('11.222.333/0001-81')).toBe(true)
  })

  it('rejects a CNPJ with a wrong check digit', () => {
    expect(isValidCnpj('11222333000180')).toBe(false)
  })

  it('rejects CNPJs made of a single repeated digit', () => {
    expect(isValidCnpj('00000000000000')).toBe(false)
  })

  it('rejects CNPJs of the wrong length', () => {
    expect(isValidCnpj('1122233300018')).toBe(false)
    expect(isValidCnpj('112223330001811')).toBe(false)
  })

  it('rejects empty and non-digit input', () => {
    expect(isValidCnpj('')).toBe(false)
    expect(isValidCnpj('abcdefghijklmn')).toBe(false)
  })
})

describe('isValidDocument', () => {
  it('accepts a valid CPF (11 digits)', () => {
    expect(isValidDocument('52998224725')).toBe(true)
    expect(isValidDocument('529.982.247-25')).toBe(true)
  })

  it('accepts a valid CNPJ (14 digits)', () => {
    expect(isValidDocument('11222333000181')).toBe(true)
    expect(isValidDocument('11.222.333/0001-81')).toBe(true)
  })

  it('rejects an invalid-checksum document at a valid length', () => {
    expect(isValidDocument('52998224724')).toBe(false)
    expect(isValidDocument('11222333000180')).toBe(false)
  })

  it('rejects any other length', () => {
    expect(isValidDocument('5299822472')).toBe(false)
    expect(isValidDocument('529982247250')).toBe(false)
    expect(isValidDocument('1122233300018')).toBe(false)
    expect(isValidDocument('')).toBe(false)
  })
})

describe('documentDigits', () => {
  it('strips every non-digit from masked input', () => {
    expect(documentDigits('529.982.247-25')).toBe('52998224725')
    expect(documentDigits('11.222.333/0001-81')).toBe('11222333000181')
  })

  it('returns an empty string for nullish input', () => {
    expect(documentDigits('')).toBe('')
    expect(documentDigits(null)).toBe('')
    expect(documentDigits(undefined)).toBe('')
  })
})

describe('formatDocument', () => {
  it('masks 11 digits as a CPF', () => {
    expect(formatDocument('52998224725')).toBe('529.982.247-25')
  })

  it('masks 14 digits as a CNPJ', () => {
    expect(formatDocument('11222333000181')).toBe('11.222.333/0001-81')
  })

  it('returns an em dash for empty input', () => {
    expect(formatDocument('')).toBe('—')
    expect(formatDocument(null)).toBe('—')
    expect(formatDocument(undefined)).toBe('—')
  })

  it('returns bare digits for an incomplete length', () => {
    expect(formatDocument('5299822')).toBe('5299822')
  })
})
