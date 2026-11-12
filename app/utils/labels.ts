/** pt-BR display labels for enum/data values shown in the UI. */

const petStatusLabels: Record<string, string> = {
  available: 'Disponível',
  pending: 'Pendente',
  adopted: 'Adotado',
}

const applicationStatusLabels: Record<string, string> = {
  pending: 'Pendente',
  approved: 'Aprovada',
  rejected: 'Rejeitada',
  canceled: 'Cancelada',
}

const petSexLabels: Record<string, string> = {
  male: 'Macho',
  female: 'Fêmea',
  unknown: 'Desconhecido',
}

const petSizeLabels: Record<string, string> = {
  small: 'Pequeno',
  medium: 'Médio',
  large: 'Grande',
}

const userRoleLabels: Record<string, string> = {
  admin: 'Administrador',
  staff: 'Equipe',
  adopter: 'Adotante',
}

const homeLabels: Record<string, string> = {
  house: 'Casa',
  apartment: 'Apartamento',
}

const enclosureTypeLabels: Record<string, string> = {
  walled: 'Possui muros',
  fenced: 'Cercado',
  fully_enclosed: 'Totalmente fechado',
  is_netted: 'Telado',
}

export const petStatusLabel = (v: string) => petStatusLabels[v] ?? v
export const applicationStatusLabel = (v: string) => applicationStatusLabels[v] ?? v
export const petSexLabel = (v: string) => petSexLabels[v] ?? v
export const userRoleLabel = (v: string) => userRoleLabels[v] ?? v
export const petSizeLabel = (v: string | null | undefined) => (v ? (petSizeLabels[v] ?? v) : '—')
export const homeLabel = (v: string | null | undefined) => (v ? (homeLabels[v] ?? v) : '—')
export const enclosureTypeLabel = (v: string) => enclosureTypeLabels[v] ?? v
export const yesNoLabel = (v: boolean | null | undefined) =>
  v == null ? '—' : v ? 'Sim' : 'Não'
