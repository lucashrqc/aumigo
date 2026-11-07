import type { Component } from 'vue'

/** Row-selection mode for the DataTable checkbox column. */
export type RowSelectionMode = 'none' | 'single' | 'multiple'

/** A single row action for the DataTable actions column. */
export interface RowAction<TData> {
  label: string
  icon?: Component
  iconClass?: string
  class?: string
  hidden?: (row: TData) => boolean
  onClick: (row: TData) => void
}
