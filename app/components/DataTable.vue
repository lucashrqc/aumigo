<script
  setup
  lang="ts"
  generic="TData extends RowData & { id?: string | number }"
>
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ColumnDef, RowData, RowSelectionState } from '@tanstack/vue-table'
import { FlexRender, useTable } from '@tanstack/vue-table'
import { computed, h } from 'vue'
import { features, type Features } from './features'

const props = withDefaults(
  defineProps<{
    columns: ColumnDef<Features, TData>[]
    data: TData[]
    selection?: RowSelectionMode
    getRowId?: (row: TData) => string
    isLoading?: boolean
  }>(),
  { selection: 'none', getRowId: undefined, isLoading: false },
)

// Number of placeholder rows rendered while loading.
const SKELETON_ROWS = 5

const selected = defineModel<TData[]>('selected', { default: () => [] })

const rowId = (row: TData, index: number) =>
  props.getRowId?.(row) ?? (row.id != null ? String(row.id) : String(index))

const rowSelection = computed<RowSelectionState>(() => {
  const map: RowSelectionState = {}
  props.data.forEach((row, i) => {
    if (selected.value.includes(row)) map[rowId(row, i)] = true
  })
  return map
})

// Injected first column holding the selection checkboxes.
const selectColumn: ColumnDef<Features, TData> = {
  id: 'select',
  enableSorting: false,
  enableHiding: false,
  meta: { class: 'w-10' },
  header: ({ table }) =>
    props.selection === 'multiple'
      ? h(Checkbox, {
          modelValue:
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate'),
          'onUpdate:modelValue': (value) =>
            table.toggleAllPageRowsSelected(!!value),
          'aria-label': 'Selecionar todos',
        })
      : null,
  cell: ({ row }) =>
    h(Checkbox, {
      modelValue: row.getIsSelected(),
      'onUpdate:modelValue': (value) => row.toggleSelected(!!value),
      'aria-label': 'Selecionar linha',
    }),
}

const allColumns = computed<ColumnDef<Features, TData>[]>(() =>
  props.selection === 'none' ? props.columns : [selectColumn, ...props.columns],
)

const table = useTable({
  features,
  get data() {
    return props.data
  },
  get columns() {
    return allColumns.value
  },
  getRowId: rowId,
  get enableRowSelection() {
    return props.selection !== 'none'
  },
  get enableMultiRowSelection() {
    return props.selection === 'multiple'
  },
  state: {
    get rowSelection() {
      return rowSelection.value
    },
  },
  onRowSelectionChange: (updater) => {
    const next =
      typeof updater === 'function' ? updater(rowSelection.value) : updater
    selected.value = table
      .getCoreRowModel()
      .rows.filter((r) => next[r.id])
      .map((r) => r.original)
  },
})
</script>

<template>
  <div class="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow
          v-for="headerGroup in table.getHeaderGroups()"
          :key="headerGroup.id"
        >
          <TableHead
            v-for="header in headerGroup.headers"
            :key="header.id"
            :colspan="header.colSpan"
            :class="header.column.columnDef.meta?.class"
          >
            <FlexRender v-if="!header.isPlaceholder" :header="header" />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <tr v-if="isLoading" aria-hidden="true">
          <td :colspan="table.getVisibleFlatColumns().length" class="h-0.5 p-0">
            <div class="h-0.5 w-full overflow-hidden bg-primary/15">
              <div
                class="h-full w-1/4 animate-indeterminate rounded-full bg-primary"
              />
            </div>
          </td>
        </tr>

        <template v-if="isLoading">
          <TableRow v-for="n in SKELETON_ROWS" :key="`skeleton-${n}`">
            <TableCell
              v-for="column in table.getVisibleFlatColumns()"
              :key="column.id"
              :class="['text-xs', column.columnDef.meta?.class]"
            >
              <Skeleton class="h-6 w-full" />
            </TableCell>
          </TableRow>
        </template>
        <template v-else-if="table.getRowModel().rows.length">
          <TableRow v-for="row in table.getRowModel().rows" :key="row.id">
            <TableCell
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
              :class="['text-xs', cell.column.columnDef.meta?.class]"
            >
              <FlexRender :cell="cell" />
            </TableCell>
          </TableRow>
        </template>
        <TableEmpty v-else :colspan="table.getVisibleFlatColumns().length">
          <slot name="empty">No records found.</slot>
        </TableEmpty>
      </TableBody>
    </Table>
  </div>
</template>
