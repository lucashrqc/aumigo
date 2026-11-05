export interface EmailMessage {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Email sending port. v1 ships a console adapter (logs the message, useful for
 * surfacing staff-invite links in dev). A future Resend adapter implements the
 * same interface — Dependency Inversion.
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
