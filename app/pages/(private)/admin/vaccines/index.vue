<script setup lang="ts">
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import DataTableRowActions from '@/components/DataTableRowActions.vue'
import type { Features } from '@/components/features'
import { Pencil, Trash2 } from '@lucide/vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { h, type Component } from 'vue'
import { toast } from 'vue-sonner'
import { auditColumns } from '~/utils/audit-columns'

definePageMeta({ layout: 'private', middleware: 'staff' })
useHead({ title: 'Vacinas — Admin' })

const page = ref(1)
const { data, isLoading } = useAdminVaccinesQuery(() => ({
  page: page.value,
  pageSize: 10,
}))
const { mutateAsync: createVaccine, isPending: creating } = useCreateVaccine()
const { mutateAsync: updateVaccine, isPending: saving } = useUpdateVaccine()
const { mutateAsync: deleteVaccine } = useDeleteVaccine()

const dialog = useDialog()
const dialogOpen = ref(false)
const editOpen = ref(false)
const editing = ref<VaccineDto | null>(null)

async function handleCreate(payload: Parameters<typeof createVaccine>[0]) {
  try {
    await createVaccine(payload)
    dialogOpen.value = false
    toast.success('Vacina criada')
  } catch (err) {
    toast.error(resolveErrorMessage(err, 'Não foi possível criar a vacina'))
  }
}

async function handleUpdate(payload: Parameters<typeof updateVaccine>[0]['body']) {
  if (!editing.value) return
  try {
    await updateVaccine({ id: editing.value.id, body: payload })
    editOpen.value = false
    toast.success('Vacina atualizada')
  } catch (err) {
    toast.error(resolveErrorMessage(err, 'Não foi possível atualizar a vacina'))
  }
}

async function handleDelete(id: string, name: string) {
  const ok = await dialog.open<boolean>(ConfirmDialog, {
    dialogProps: { class: 'max-w-md' },
    props: {
      title: 'Desativar vacina',
      description: `Desativar ${name}? Ela será ocultada do catálogo.`,
      confirmText: 'Desativar',
      destructive: true,
    },
  })
  if (!ok) return
  try {
    await deleteVaccine(id)
    toast.success('Vacina desativada')
  } catch (err) {
    toast.error(resolveErrorMessage(err))
  }
}

const actions: RowAction<VaccineDto>[] = [
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
    iconClass: 'text-red-400',
    class: 'text-destructive',
    onClick: (row) => handleDelete(row.id, row.name),
  },
]

const columns: ColumnDef<Features, VaccineDto>[] = [
  { accessorKey: 'name', header: 'Nome' },
  {
    id: 'description',
    header: 'Descrição',
    cell: ({ row }) => row.original.description ?? '—',
  },
  {
    id: 'expirationDate',
    header: 'Validade',
    cell: ({ row }) => formatDate(row.original.expirationDate),
  },
  ...auditColumns<VaccineDto>(),
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
      <h1 class="text-2xl font-bold">Vacinas</h1>
      <Dialog v-model:open="dialogOpen">
        <DialogTrigger as-child><Button>Nova vacina</Button></DialogTrigger>
        <DialogContent class="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova vacina</DialogTitle>
            <DialogDescription
              >Adicione uma vacina ao catálogo.</DialogDescription
            >
          </DialogHeader>
          <VaccineForm :submitting="creating" @submit="handleCreate" />
        </DialogContent>
      </Dialog>
    </div>

    <DataTable
      :columns="columns"
      :data="data?.items ?? []"
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
          <DialogTitle>Editar vacina</DialogTitle>
          <DialogDescription>Atualize os dados da vacina.</DialogDescription>
        </DialogHeader>
        <VaccineForm
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
