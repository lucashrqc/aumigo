import { randomBytes } from 'node:crypto'
import type { EmailSender } from '../email/email-sender'
import type {
  StaffInvitationRepository,
  StaffProfileRepository,
} from '../repositories/staff.repository'
import type { IdentityProvider } from './identity'
import type { InvitationAcceptInput, InvitationCreateInput } from '#shared/schemas'

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000

export class StaffService {
  constructor(
    private readonly invitations: StaffInvitationRepository,
    private readonly profiles: StaffProfileRepository,
    private readonly identity: IdentityProvider,
    private readonly email: EmailSender,
    private readonly appBaseUrl: string,
  ) {}

  listInvitations() {
    return this.invitations.list()
  }

  /** Admin invites an employee by email; emails them a registration link. */
  async invite(input: InvitationCreateInput, invitedBy: string) {
    const token = randomBytes(32).toString('hex')
    const invitation = await this.invitations.create({
      email: input.email,
      role: input.role,
      token,
      expiresAt: new Date(Date.now() + INVITE_TTL_MS),
      invitedBy,
    })

    const link = `${this.appBaseUrl}/register?invite=${token}`
    await this.email.send({
      to: input.email,
      subject: 'Seu convite para a equipe Aumor',
      html: `<p>Você foi convidado para fazer parte da Aumor como <strong>${input.role}</strong>.</p>
             <p><a href="${link}">Aceitar convite</a></p>`,
      text: `Você foi convidado para fazer parte da Aumor como ${input.role}. Aceite: ${link}`,
    })

    return invitation
  }

  /** Employee consumes an invitation token to create their staff account. */
  async acceptInvitation(input: InvitationAcceptInput) {
    const invitation = await this.invitations.findValidByToken(input.token)
    if (!invitation || invitation.expiresAt.getTime() < Date.now()) {
      throw createError({ statusCode: 400, statusMessage: 'Convite inválido ou expirado' })
    }

    const { id: userId } = await this.identity.createUser({
      email: invitation.email,
      password: input.password,
      name: input.name,
    })

    await this.identity.setRole(userId, invitation.role)
    await this.profiles.create({ userId, name: input.name, phone: input.phone })
    await this.invitations.markAccepted(invitation.id)

    return { userId, role: invitation.role, email: invitation.email }
  }
}
