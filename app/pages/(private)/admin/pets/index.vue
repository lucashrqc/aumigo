<script setup lang="ts">
import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { Features } from '@/components/features'
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'private', middleware: 'staff' })
useHead({ title: 'Pets — Admin' })

const page = ref(1)
const { data, isLoading } = useAdminPetsQuery(() => ({ page: page.value, pageSize: 10 }))
const { mutateAsync: createPet, isPending: creating } = useCreatePet()
const { mutateAsync: deletePet } = useDeletePet()

const dialogOpen = ref(false)
const NuxtLink = resolveComponent('NuxtLink')

async function handleCreate(payload: Parameters<typeof createPet>[0]) {
  try {
    await createPet(payload)
    dialogOpen.value = false
    toast.success('Pet criado')
  } catch (err) {
    toast.error(resolveErrorMessage(err, 'Não foi possível criar o pet'))
  }
}

async function handleDelete(id: string, name: string) {
  if (!confirm(`Desativar ${name}? Ele será ocultado do site público.`)) return
  try {
    await deletePet(id)
    toast.success('Pet desativado')
  } catch (err) {
    toast.error(resolveErrorMessage(err))
  }
}

const columns: ColumnDef<Features, PetDto>[] = [
  { accessorKey: 'name', header: 'Nome' },
  {
    id: 'species',
    header: 'Espécie',
    cell: ({ row }) => row.original.species?.name ?? '—',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) =>
      h(
        'span',
        { class: 'rounded px-2 py-0.5 text-xs font-medium bg-muted' },
        petStatusLabel(row.original.status),
      ),
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) =>
      h('div', { class: 'flex justify-end gap-2' }, [
        h(
          NuxtLink,
          { to: `/admin/pets/${row.original.id}`, class: 'text-sm underline' },
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
      <h1 class="text-2xl font-bold">Pets</h1>
      <div class="flex items-center gap-2">
        <Dialog v-model:open="dialogOpen">
          <DialogTrigger as-child><Button variant="outline">Novo pet</Button></DialogTrigger>
          <DialogContent class="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo pet</DialogTitle>
              <DialogDescription>Adicione um pet ao catálogo de adoção.</DialogDescription>
            </DialogHeader>
            <PetForm :submitting="creating" @submit="handleCreate" />
          </DialogContent>
        </Dialog>
        <Button as-child><NuxtLink to="/admin/pets/cadastrar">Cadastrar pet</NuxtLink></Button>
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
