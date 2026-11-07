<script setup lang="ts">
import DataTableRowActions from '@/components/DataTableRowActions.vue'
import type { Features } from '@/components/features'
import { Pencil, Trash2 } from '@lucide/vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { h, type Component } from 'vue'
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'private', middleware: 'staff' })
useHead({ title: 'Espécies — Admin' })

const page = ref(1)
const { data, isLoading } = useAdminSpeciesQuery(() => ({
  page: page.value,
  pageSize: 10,
}))
const { mutateAsync: createSpecies, isPending: creating } = useCreateSpecies()
const { mutateAsync: updateSpecies, isPending: saving } = useUpdateSpecies()
const { mutateAsync: deleteSpecies } = useDeleteSpecies()

const dialogOpen = ref(false)
const editOpen = ref(false)
const editing = ref<SpeciesDto | null>(null)

async function handleCreate(payload: Parameters<typeof createSpecies>[0]) {
  try {
    await createSpecies(payload)
    dialogOpen.value = false
    toast.success('Espécie criada')
  } catch (err) {
    toast.error(resolveErrorMessage(err, 'Não foi possível criar a espécie'))
  }
}

async function handleUpdate(payload: Parameters<typeof updateSpecies>[0]['body']) {
  if (!editing.value) return
  try {
    await updateSpecies({ id: editing.value.id, body: payload })
    editOpen.value = false
    toast.success('Espécie atualizada')
  } catch (err) {
    toast.error(resolveErrorMessage(err, 'Não foi possível atualizar a espécie'))
  }
}

async function handleDelete(id: string, name: string) {
  if (!confirm(`Excluir ${name}? Esta ação não pode ser desfeita.`)) return
  try {
    await deleteSpecies(id)
    toast.success('Espécie excluída')
  } catch (err) {
    toast.error(resolveErrorMessage(err))
  }
}

const actions: RowAction<SpeciesDto>[] = [
  {
    label: 'Editar',
    icon: Pencil,
    onClick: (row) => {
      editing.value = row
      editOpen.value = true
    },
  },
  {
    label: 'Excluir',
    icon: Trash2,
    class: 'text-destructive',
    onClick: (row) => handleDelete(row.id, row.name),
  },
]

const columns: ColumnDef<Features, SpeciesDto>[] = [
  { accessorKey: 'name', header: 'Nome' },
  ...auditColumns<SpeciesDto>(),
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
      <h1 class="text-2xl font-bold">Espécies</h1>
      <Dialog v-model:open="dialogOpen">
        <DialogTrigger as-child><Button>Nova espécie</Button></DialogTrigger>
        <DialogContent class="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova espécie</DialogTitle>
            <DialogDescription>Adicione uma espécie ao catálogo.</DialogDescription>
          </DialogHeader>
          <SpeciesForm :submitting="creating" @submit="handleCreate" />
        </DialogContent>
      </Dialog>
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

    <Dialog v-model:open="editOpen">
      <DialogContent class="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar espécie</DialogTitle>
          <DialogDescription>Atualize os dados da espécie.</DialogDescription>
        </DialogHeader>
        <SpeciesForm
          v-if="editing"
          :key="editing.id"
          :initial="editing"
          :submitting="saving"
          @submit="handleUpdate"
        />
      </DialogContent>
    </Dialog>
  </div>
</template>
