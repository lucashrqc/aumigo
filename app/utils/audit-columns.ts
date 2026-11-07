import type { ColumnDef } from '@tanstack/vue-table'
import type { AuditFieldsDto } from '#shared/types'
import type { Features } from '@/components/features'
import { formatDateTime } from '@/utils/format'

/**
 * Standard audit columns for admin list tables: who created/updated the row and when.
 * Works for any DTO carrying the shared audit fields (species, breed, vaccine, pet…).
 */
export function auditColumns<T extends AuditFieldsDto>(): ColumnDef<Features, T>[] {
  return [
    {
      id: 'createdBy',
      header: 'Criado por',
      cell: ({ row }) => row.original.creator?.name ?? '—',
    },
    {
      id: 'updatedBy',
      header: 'Atualizado por',
      cell: ({ row }) => row.original.updater?.name ?? '—',
    },
    {
      id: 'createdAt',
      header: 'Criado em',
      meta: { class: 'whitespace-nowrap' },
      cell: ({ row }) => formatDateTime(row.original.createdAt),
    },
    {
      id: 'updatedAt',
      header: 'Atualizado em',
      meta: { class: 'whitespace-nowrap' },
      cell: ({ row }) => formatDateTime(row.original.updatedAt),
    },
  ]
}
