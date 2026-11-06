<script setup lang="ts">
import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { Features } from '@/components/features'
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'private', middleware: 'staff' })
useHead({ title: 'Vacinas — Admin' })

const page = ref(1)
const { data, isLoading } = useAdminVaccinesQuery(() => ({ page: page.value, pageSize: 10 }))
const { mutateAsync: createVaccine, isPending: creating } = useCreateVaccine()
const { mutateAsync: deleteVaccine } = useDeleteVaccine()

const dialogOpen = ref(false)
const NuxtLink = resolveComponent('NuxtLink')

async function handleCreate(payload: Parameters<typeof createVaccine>[0]) {
  try {
    await createVaccine(payload)
    dialogOpen.value = false
    toast.success('Vacina criada')
  } catch (err) {
    toast.error(resolveErrorMessage(err, 'Não foi possível criar a vacina'))
  }
}

async function handleDelete(id: string, name: string) {
  if (!confirm(`Desativar ${name}? Ela será ocultada do catálogo.`)) return
  try {
    await deleteVaccine(id)
    toast.success('Vacina desativada')
  } catch (err) {
    toast.error(resolveErrorMessage(err))
  }
}

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
    cell: ({ row }) => row.original.expirationDate ?? '—',
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) =>
      h('div', { class: 'flex justify-end gap-2' }, [
        h(
          NuxtLink,
          { to: `/admin/vaccines/${row.original.id}`, class: 'text-sm underline' },
          () => 'Editar',
        ),
        h(
          'button',
          {
            class: 'text-sm text-destructive underline',
            onClick: () => handleDelete(row.original.id, row.original.name),
          },
          'Excluir',
        ),
      ]),
  },
]
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Vacinas</h1>
      <div class="flex items-center gap-2">
        <Dialog v-model:open="dialogOpen">
          <DialogTrigger as-child><Button variant="outline">Nova vacina</Button></DialogTrigger>
          <DialogContent class="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova vacina</DialogTitle>
              <DialogDescription>Adicione uma vacina ao catálogo.</DialogDescription>
            </DialogHeader>
            <VaccineForm :submitting="creating" @submit="handleCreate" />
          </DialogContent>
        </Dialog>
        <Button as-child><NuxtLink to="/admin/vaccines/cadastrar">Cadastrar vacina</NuxtLink></Button>
      </div>
    </div>

    <p v-if="isLoading" class="text-muted-foreground">Carregando…</p>
    <template v-else>
      <DataTable :columns="columns" :data="data?.items ?? []" />
      <Pagination
        v-if="data"
        :page="data.page"
        :page-size="data.pageSize"
        :total="data.total"
        @update:page="page = $event"
      />
    </template>
  </div>
</template>
