<script setup lang="ts">
import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
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
    toast.success('Pet created')
  } catch (err) {
    toast.error(resolveErrorMessage(err, 'Could not create pet'))
  }
}

async function handleDelete(id: string, name: string) {
  if (!confirm(`Deactivate ${name}? It will be hidden from the public site.`)) return
  try {
    await deletePet(id)
    toast.success('Pet deactivated')
  } catch (err) {
    toast.error(resolveErrorMessage(err))
  }
}

const columns: ColumnDef<PetDto, unknown>[] = [
  { accessorKey: 'name', header: 'Name' },
  {
    id: 'species',
    header: 'Species',
    cell: ({ row }) => row.original.species?.name ?? '—',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) =>
      h('span', { class: 'rounded px-2 py-0.5 text-xs font-medium capitalize bg-muted' }, row.original.status),
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) =>
      h('div', { class: 'flex justify-end gap-2' }, [
        h(
          NuxtLink,
          { to: `/admin/pets/${row.original.id}`, class: 'text-sm underline' },
          () => 'Edit',
        ),
        h(
          'button',
          {
            class: 'text-sm text-destructive underline',
            onClick: () => handleDelete(row.original.id, row.original.name),
          },
          'Delete',
        ),
      ]),
  },
]
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Pets</h1>
      <Dialog v-model:open="dialogOpen">
        <DialogTrigger as-child><Button>New pet</Button></DialogTrigger>
        <DialogContent class="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New pet</DialogTitle>
            <DialogDescription>Add a pet to the adoption catalog.</DialogDescription>
          </DialogHeader>
          <PetForm :submitting="creating" @submit="handleCreate" />
        </DialogContent>
      </Dialog>
    </div>

    <p v-if="isLoading" class="text-muted-foreground">Loading…</p>
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
