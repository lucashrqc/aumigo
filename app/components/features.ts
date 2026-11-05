import {
  columnVisibilityFeature,
  createSortedRowModel,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
} from '@tanstack/vue-table'

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
