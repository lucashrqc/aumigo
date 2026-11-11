import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin } from 'better-auth/plugins'
import { account, session, user, verification } from '../database/schema'
import { createEmailSender } from '../email/email-sender'
import { useDb } from './db'

function buildAuth() {
  const config = useRuntimeConfig()
  const googleConfigured = Boolean(
    config.googleClientId && config.googleClientSecret,
  )
  const emailSender = createEmailSender({
    provider: config.emailProvider,
    smtp: {
      host: config.smtpHost,
      port: config.smtpPort,
      user: config.smtpUser,
      pass: config.smtpPass,
      from: config.smtpFrom,
    },
    resend: { apiKey: config.resendApiKey, from: config.resendFromEmail },
  })

  return betterAuth({
    baseURL: config.betterAuthUrl,
    secret: config.betterAuthSecret,
    database: drizzleAdapter(useDb(), {
      provider: 'pg',
      schema: { user, session, account, verification },
    }),
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      minPasswordLength: 8,
      resetPasswordTokenExpiresIn: 3600,
      sendResetPassword: async ({ user: recipient, url }) => {
        await emailSender.send({
          to: recipient.email,
          subject: 'Redefinição de senha — Aumigo',
          html: `<p>Recebemos um pedido para redefinir a senha da sua conta Aumigo.</p>
                 <p><a href="${url}">Redefinir minha senha</a></p>
                 <p>Se você não solicitou, ignore este e-mail. O link expira em 1 hora.</p>`,
          text: `Redefina sua senha da Aumigo: ${url} (o link expira em 1 hora). Se você não solicitou, ignore este e-mail.`,
        })
      },
    },
    // Google is prepared but only enabled once credentials are provided.
    socialProviders: googleConfigured
      ? {
          google: {
            clientId: config.googleClientId,
            clientSecret: config.googleClientSecret,
          },
        }
      : {},
    // Only the `admin` role can use BetterAuth admin-plugin operations;
    // domain admin-panel access (staff + admin) is enforced in requireStaff().
    plugins: [admin({ adminRoles: ['admin'], defaultRole: 'adopter' })],
  })
}

export type Auth = ReturnType<typeof buildAuth>

let _auth: Auth | undefined

/** Memoized BetterAuth instance for the Nitro runtime. */
export function useAuth(): Auth {
  if (!_auth) {
    _auth = buildAuth()
  }
  return _auth
}
