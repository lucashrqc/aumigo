import { Resend } from 'resend'

export interface EmailMessage {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Email sending port. ConsoleEmailSender logs the message (surfaces staff-invite
 * links in dev); ResendEmailSender delivers via Resend. Both implement this
 * interface — the composition root picks one — Dependency Inversion.
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
