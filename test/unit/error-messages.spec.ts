import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { resolveAuthErrorMessage } from '../../shared/utils/auth-error-messages'
import { configureZodLocale } from '../../shared/utils/zod-locale'

describe('resolveAuthErrorMessage', () => {
  it('maps a known BetterAuth code to a pt-BR message', () => {
    expect(resolveAuthErrorMessage({ code: 'INVALID_EMAIL_OR_PASSWORD' })).toBe(
      'E-mail ou senha incorretos',
    )
    expect(resolveAuthErrorMessage({ code: 'USER_ALREADY_EXISTS' })).toBe(
      'Este e-mail já está em uso',
    )
  })

  it('returns the fallback for unknown, missing or empty errors', () => {
    expect(resolveAuthErrorMessage({ code: 'SOMETHING_ELSE' }, 'Falhou')).toBe(
      'Falhou',
    )
    expect(resolveAuthErrorMessage(null, 'Falhou')).toBe('Falhou')
    expect(resolveAuthErrorMessage(undefined, 'Falhou')).toBe('Falhou')
    expect(resolveAuthErrorMessage({ message: 'x' }, 'Falhou')).toBe('Falhou')
  })

  it('uses the default fallback when none is provided', () => {
    expect(resolveAuthErrorMessage({})).toBe(
      'Não foi possível concluir a solicitação',
    )
  })
})

describe('configureZodLocale', () => {
  it('makes default Zod validation messages pt-BR', () => {
    configureZodLocale()
    const result = z.string().min(1).safeParse('')

    expect(result.success).toBe(false)
    if (result.success) return
    const message = result.error.issues[0]?.message ?? ''

    expect(message.length).toBeGreaterThan(0)
    expect(message).not.toMatch(/too small|expected|invalid/i)
    expect(message).toContain('Pequeno demais')
  })
})
