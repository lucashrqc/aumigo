<script setup lang="ts">
import DataTableRowActions from '@/components/DataTableRowActions.vue'
import type { Features } from '@/components/features'
import { Heart, PawPrint, Pencil, Stethoscope, Trash2 } from '@lucide/vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { h, type Component } from 'vue'
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'private', middleware: 'staff' })
useHead({ title: 'Pets — Admin' })

const page = ref(1)
const { data, isLoading } = useAdminPetsQuery(() => ({
  page: page.value,
  pageSize: 10,
}))
const { data: stats } = useAdminPetStatsQuery()

const statCards = computed(() => [
  {
    key: 'available',
    label: 'Disponíveis',
    value: stats.value?.available ?? 0,
    icon: PawPrint,
    hint: 'Pets prontos para adoção',
  },
  {
    key: 'adopted',
    label: 'Adotados',
    value: stats.value?.adopted ?? 0,
    icon: Heart,
    hint: 'Pets que encontraram um lar',
  },
  {
    key: 'neutered',
    label: 'Castrados',
    value: stats.value?.neutered ?? 0,
    icon: Stethoscope,
    hint: 'Pets ativos já castrados',
  },
])
const { mutateAsync: createPet, isPending: creating } = useCreatePet()
const { mutateAsync: deletePet } = useDeletePet()

const dialogOpen = ref(false)
const selected = ref<PetDto[]>([])

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

const actions: RowAction<PetDto>[] = [
  {
    label: 'Editar',
    icon: Pencil,
    onClick: (row) => navigateTo(`/admin/pets/${row.id}`),
  },
  {
    label: 'Excluir',
    icon: Trash2,
    class: 'text-destructive',
    onClick: (row) => handleDelete(row.id, row.name),
  },
]

const columns: ColumnDef<Features, PetDto>[] = [
  { accessorKey: 'name', header: 'Nome' },
  {
    id: 'species',
    header: 'Espécie',
    cell: ({ row }) => row.original.species?.name ?? '—',
  },
  {
    id: 'sex',
    header: 'Sexo',
    cell: ({ row }) => petSexLabel(row.original.sex),
  },
  {
    id: 'neutered',
    header: 'Castrado',
    cell: ({ row }) => (row.original.neutered ? 'Sim' : 'Não'),
  },
  ...auditColumns<PetDto>(),
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
      <h1 class="text-2xl font-bold">Pets</h1>
      <Dialog v-model:open="dialogOpen">
        <DialogContent class="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo pet</DialogTitle>
            <DialogDescription
              >Adicione um pet ao catálogo de adoção.</DialogDescription
            >
          </DialogHeader>
          <PetForm :submitting="creating" @submit="handleCreate" />
        </DialogContent>
      </Dialog>
    </div>

    <div class="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
      <Card
        v-for="card in statCards"
        :key="card.key"
        class="from-primary/5 to-card dark:bg-card @container/card bg-gradient-to-t shadow-xs"
      >
        <CardHeader>
          <CardDescription>{{ card.label }}</CardDescription>
          <CardTitle class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {{ card.value }}
          </CardTitle>
          <CardAction>
            <component :is="card.icon" class="text-muted-foreground size-5" />
          </CardAction>
        </CardHeader>
        <CardFooter class="text-muted-foreground text-sm">
          {{ card.hint }}
        </CardFooter>
      </Card>
    </div>

    <div class="flex justify-end">
      <Button as-child
        ><NuxtLink to="/admin/pets/cadastrar">Cadastrar pet</NuxtLink></Button
      >
    </div>

    <DataTable
      v-model:selected="selected"
      :columns="columns"
      :data="data?.items ?? []"
      selection="none"
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
