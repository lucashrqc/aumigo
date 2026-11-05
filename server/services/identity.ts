/**
 * Identity port — abstracts the auth provider (BetterAuth) so services depend
 * on a role-agnostic interface rather than the concrete auth library.
 */
export interface IdentityProvider {
  createUser(input: { email: string; password: string; name: string }): Promise<{ id: string }>
  setRole(userId: string, role: 'admin' | 'staff' | 'adopter'): Promise<void>
}
