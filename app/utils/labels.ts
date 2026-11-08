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

export const petStatusLabel = (v: string) => petStatusLabels[v] ?? v
export const applicationStatusLabel = (v: string) => applicationStatusLabels[v] ?? v
export const petSexLabel = (v: string) => petSexLabels[v] ?? v
export const petSizeLabel = (v: string | null | undefined) => (v ? (petSizeLabels[v] ?? v) : '—')
