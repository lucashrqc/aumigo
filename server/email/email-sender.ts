import { Resend } from 'resend'
import nodemailer, { type Transporter } from 'nodemailer'
import { waitUntil } from '@vercel/functions'

export interface EmailMessage {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Email sending port. ConsoleEmailSender logs the message (surfaces staff-invite
 * and password-reset links in dev); SmtpEmailSender delivers via SMTP (Gmail for
 * the MVP); ResendEmailSender delivers via Resend (kept for future use). Both
 * concrete senders implement this interface — the composition root picks one via
 * EMAIL_PROVIDER — Dependency Inversion.
 */
export interface EmailSender {
  send(message: EmailMessage): Promise<void>
}

export class ConsoleEmailSender implements EmailSender {
  async send(message: EmailMessage): Promise<void> {
    console.info(
      `[email] to=${message.to} subject="${message.subject}"\n${message.text ?? message.html}`,
    )
  }
}

export interface SmtpOptions {
  host: string
  port: number
  user: string
  pass: string
  from: string
}

export class SmtpEmailSender implements EmailSender {
  private readonly transporter: Transporter

  constructor(private readonly options: SmtpOptions) {
    this.transporter = nodemailer.createTransport({
      host: options.host,
      port: options.port,
      secure: options.port === 465,
      auth: { user: options.user, pass: options.pass },
    })
  }

  async send(message: EmailMessage): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.options.from,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
      })
    } catch (error) {
      throw createError({
        statusCode: 502,
        statusMessage: `Email send failed: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      })
    }
  }
}

export class ResendEmailSender implements EmailSender {
  private readonly client: Resend

  constructor(
    apiKey: string,
    private readonly from: string,
  ) {
    this.client = new Resend(apiKey)
  }

  async send(message: EmailMessage): Promise<void> {
    const { error } = await this.client.emails.send({
      from: this.from,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    })
    if (error) {
      throw createError({
        statusCode: 502,
        statusMessage: `Email send failed: ${error.message}`,
      })
    }
  }
}

/**
 * Non-blocking decorator. Returns immediately after scheduling delivery so the
 * HTTP response is not held back by SMTP. On Vercel serverless, waitUntil keeps
 * the function alive until the send resolves (a bare fire-and-forget promise
 * would be dropped once the response is sent). Off Vercel (local dev, Docker,
 * any long-lived Node server) there is no request context, so waitUntil throws
 * and we fall back to fire-and-forget — the running event loop keeps the promise
 * alive. Either way a failure is logged, never surfaced to the caller.
 */
export class DeferredEmailSender implements EmailSender {
  constructor(private readonly inner: EmailSender) {}

  async send(message: EmailMessage): Promise<void> {
    const task = this.inner
      .send(message)
      .catch((err) => console.error('[email] background send failed', err))
    try {
      waitUntil(task)
    } catch {
      // No Vercel request context: fire-and-forget is safe here.
    }
  }
}

export interface EmailSenderOptions {
  provider: string
  smtp: SmtpOptions
  resend: { apiKey: string; from: string }
}

/**
 * Selects the email adapter by EMAIL_PROVIDER and wraps it so dispatch never
 * blocks the request. Called by both composition roots (services + auth).
 */
export function createEmailSender(options: EmailSenderOptions): EmailSender {
  const base = selectBase(options)
  return new DeferredEmailSender(base)
}

function selectBase(options: EmailSenderOptions): EmailSender {
  switch (options.provider) {
    case 'smtp':
      return new SmtpEmailSender(options.smtp)
    case 'resend':
      return new ResendEmailSender(options.resend.apiKey, options.resend.from)
    default:
      return new ConsoleEmailSender()
  }
}
