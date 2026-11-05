<script setup lang="ts" generic="TData extends RowData">
import type { ColumnDef, RowData } from '@tanstack/vue-table'
import { FlexRender, useTable } from '@tanstack/vue-table'
import { features, type Features } from './features'
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const props = defineProps<{
  columns: ColumnDef<Features, TData>[]
  data: TData[]
}>()

const table = useTable({
  features,
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
})
</script>

<template>
  <div class="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
          <TableHead
            v-for="header in headerGroup.headers"
            :key="header.id"
            :colspan="header.colSpan"
          >
            <FlexRender v-if="!header.isPlaceholder" :header="header" />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="table.getRowModel().rows.length">
          <TableRow v-for="row in table.getRowModel().rows" :key="row.id">
            <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
              <FlexRender :cell="cell" />
            </TableCell>
          </TableRow>
        </template>
        <TableEmpty v-else :colspan="columns.length">
          <slot name="empty">No records found.</slot>
        </TableEmpty>
      </TableBody>
    </Table>
  </div>
</template>
