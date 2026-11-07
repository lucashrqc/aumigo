/** Derive a user's initials for avatar fallbacks. */

/**
 * Return up to two uppercase letters for a user's name.
 *
 * Multi-word names use the first letter of the first two words
 * (`Admin Lucas` → `AL`); single words use their first two letters
 * (`Admin` → `AD`). Empty or whitespace-only names return `''`.
 */
export const getInitials = (name: string | null | undefined): string => {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase()
  return (words[0]![0]! + words[1]![0]!).toUpperCase()
}
