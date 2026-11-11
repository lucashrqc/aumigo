export interface AuthErrorLike {
  code?: string
  message?: string
}

const authErrorMessages: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: 'E-mail ou senha incorretos',
  USER_NOT_FOUND: 'Usuário não encontrado',
  EMAIL_NOT_VERIFIED: 'E-mail ainda não verificado',
  PASSWORD_TOO_SHORT: 'A senha é muito curta',
  PASSWORD_TOO_LONG: 'A senha é muito longa',
  USER_ALREADY_EXISTS: 'Este e-mail já está em uso',
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    'Este e-mail já está em uso. Use outro e-mail',
  INVALID_EMAIL: 'E-mail inválido',
  INVALID_PASSWORD: 'Senha inválida',
  FAILED_TO_CREATE_USER: 'Não foi possível criar o usuário',
  FAILED_TO_CREATE_SESSION: 'Não foi possível iniciar a sessão',
  COULD_NOT_CREATE_SESSION: 'Não foi possível iniciar a sessão',
  BANNED_USER: 'Sua conta foi bloqueada',
  ACCOUNT_TEMPORARILY_LOCKED:
    'Muitas tentativas. Sua conta foi bloqueada temporariamente. Tente novamente mais tarde',
  INVALID_TOKEN: 'Link inválido ou expirado',
}

/** Maps a BetterAuth error code to a friendly pt-BR message, or the fallback. */
export function resolveAuthErrorMessage(
  error: AuthErrorLike | null | undefined,
  fallback = 'Não foi possível concluir a solicitação',
): string {
  const code = error?.code
  if (code && authErrorMessages[code]) return authErrorMessages[code]
  return fallback
}
