import {
  type CellData,
  columnVisibilityFeature,
  createSortedRowModel,
  type RowData,
  rowSelectionFeature,
  rowSortingFeature,
  type TableFeatures,
  tableFeatures,
} from '@tanstack/vue-table'

declare module '@tanstack/vue-table' {
  // Generics must match the library's ColumnMeta signature exactly (names
  // included) for the augmentation to merge, so they read as "unused" here.
  /* eslint-disable @typescript-eslint/no-unused-vars */
  interface ColumnMeta<
    in out TFeatures extends TableFeatures,
    in out TData extends RowData,
    TValue extends CellData = CellData,
  > {
    /** Tailwind classes applied to this column's <th> and <td> (e.g. width). */
    class?: string
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
}

// v9: declare only the features this table uses — anything you don't
// register is tree-shaken out of the bundle. Pagination/filtering are left
// to the caller (pages do server-side pagination), so rows are never truncated.
export const features = tableFeatures({
  columnVisibilityFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
})

export type Features = typeof features
