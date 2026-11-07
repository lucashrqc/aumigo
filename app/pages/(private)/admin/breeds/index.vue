<script setup lang="ts">
import DataTableRowActions from '@/components/DataTableRowActions.vue'
import type { Features } from '@/components/features'
import { Pencil, Trash2 } from '@lucide/vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { h, type Component } from 'vue'
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'private', middleware: 'staff' })
useHead({ title: 'Raças — Admin' })

const page = ref(1)
const { data, isLoading } = useAdminBreedsQuery(() => ({
  page: page.value,
  pageSize: 10,
}))
const { data: species } = useSpeciesQuery()
const speciesName = (speciesId: string) =>
  species.value?.find((s) => s.id === speciesId)?.name ?? '—'

const { mutateAsync: createBreed, isPending: creating } = useCreateBreed()
const { mutateAsync: deleteBreed } = useDeleteBreed()

const dialogOpen = ref(false)

async function handleCreate(payload: Parameters<typeof createBreed>[0]) {
  try {
    await createBreed(payload)
    dialogOpen.value = false
    toast.success('Raça criada')
  } catch (err) {
    toast.error(resolveErrorMessage(err, 'Não foi possível criar a raça'))
  }
}

async function handleDelete(id: string, name: string) {
  if (!confirm(`Excluir ${name}? Esta ação não pode ser desfeita.`)) return
  try {
    await deleteBreed(id)
    toast.success('Raça excluída')
  } catch (err) {
    toast.error(resolveErrorMessage(err))
  }
}

const actions: RowAction<BreedDto>[] = [
  {
    label: 'Editar',
    icon: Pencil,
    onClick: (row) => navigateTo(`/admin/breeds/${row.id}`),
  },
  {
    label: 'Excluir',
    icon: Trash2,
    class: 'text-destructive',
    onClick: (row) => handleDelete(row.id, row.name),
  },
]

const columns: ColumnDef<Features, BreedDto>[] = [
  { accessorKey: 'name', header: 'Nome' },
  {
    id: 'species',
    header: 'Espécie',
    cell: ({ row }) => speciesName(row.original.speciesId),
  },
  ...auditColumns<BreedDto>(),
  {
    id: 'actions',
    header: 'Ações',
    meta: { class: 'w-32 text-center whitespace-nowrap' },
    cell: ({ row }) =>
      h(DataTableRowActions as Component, { row: row.original, actions }),
  },
]
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Raças</h1>
      <div class="flex items-center gap-2">
        <Dialog v-model:open="dialogOpen">
          <DialogTrigger as-child><Button variant="outline">Nova raça</Button></DialogTrigger>
          <DialogContent class="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova raça</DialogTitle>
              <DialogDescription>Adicione uma raça ao catálogo.</DialogDescription>
            </DialogHeader>
            <BreedForm :submitting="creating" @submit="handleCreate" />
          </DialogContent>
        </Dialog>
        <Button as-child><NuxtLink to="/admin/breeds/cadastrar">Cadastrar raça</NuxtLink></Button>
      </div>
    </div>

    <DataTable
      :columns="columns"
      :data="data?.items ?? []"
      :get-row-id="(row) => row.id"
      :is-loading="isLoading"
    />
    <Pagination
      v-if="data"
      :page="data.page"
      :page-size="data.pageSize"
      :total="data.total"
      @update:page="page = $event"
    />
  </div>
</template>
