/**
 * Identity port — abstracts the auth provider (BetterAuth) so services depend
 * on a role-agnostic interface rather than the concrete auth library.
 */
export interface IdentityProvider {
  createUser(input: { email: string; password: string; name: string }): Promise<{ id: string }>
  setRole(userId: string, role: 'admin' | 'staff' | 'adopter'): Promise<void>
  /** Update the auth user's display name (kept in sync with the staff profile). */
  updateName(userId: string, name: string): Promise<void>
  /** Update the auth user's avatar image URL (null clears it). */
  updateImage(userId: string, image: string | null): Promise<void>
}
