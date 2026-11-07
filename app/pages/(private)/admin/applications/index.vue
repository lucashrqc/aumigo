<script setup lang="ts">
import DataTableRowActions from '@/components/DataTableRowActions.vue'
import type { Features } from '@/components/features'
import {
  Check,
  CircleCheck,
  CircleSlash,
  ClipboardList,
  Clock,
  X,
} from '@lucide/vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { h, type Component } from 'vue'
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'private', middleware: 'staff' })
useHead({ title: 'Candidaturas — Admin' })

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected'

const statusFilter = ref<StatusFilter>('pending')
const search = ref('')
const page = ref(1)

const params = computed(() => ({
  page: page.value,
  pageSize: 10,
  status: statusFilter.value === 'all' ? undefined : statusFilter.value,
  search: search.value.trim() || undefined,
}))

const { data, isLoading } = useAdminApplicationsQuery(params)
const { data: stats } = useAdminApplicationStatsQuery()
const { mutateAsync: review } = useReviewApplication()

watch([search, statusFilter], () => {
  page.value = 1
})

const statCards = computed(() => [
  {
    key: 'all' as const,
    label: 'Todas',
    value: stats.value?.total ?? 0,
    icon: ClipboardList,
    iconClass: 'text-blue-500',
    hint: 'Todas as candidaturas',
  },
  {
    key: 'approved' as const,
    label: 'Aprovadas',
    value: stats.value?.approved ?? 0,
    icon: CircleCheck,
    iconClass: 'text-green-600',
    hint: 'Candidaturas aprovadas',
  },
  {
    key: 'pending' as const,
    label: 'Pendente',
    value: stats.value?.pending ?? 0,
    icon: Clock,
    iconClass: 'text-yellow-600',
    hint: 'Aguardando análise',
  },
  {
    key: 'rejected' as const,
    label: 'Rejeitada',
    value: stats.value?.rejected ?? 0,
    icon: CircleSlash,
    iconClass: 'text-red-400',
    hint: 'Candidaturas rejeitadas',
  },
])

async function decide(id: string, decision: 'approved' | 'rejected') {
  try {
    await review({ id, body: { decision } })
    toast.success(
      decision === 'approved'
        ? 'Candidatura aprovada'
        : 'Candidatura rejeitada',
    )
  } catch (err) {
    toast.error(
      resolveErrorMessage(err, 'Não foi possível atualizar a candidatura'),
    )
  }
}

const statusClass: Record<string, string> = {
  approved:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  rejected: 'bg-destructive/10 text-destructive',
  pending:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
}

const actions: RowAction<AdoptionApplicationDto>[] = [
  {
    label: 'Aprovar',
    icon: Check,
    iconClass: 'h-4 w-4 text-emerald-600',
    onClick: (row) => decide(row.id, 'approved'),
  },
  {
    label: 'Rejeitar',
    icon: X,
    iconClass: 'h-4 w-4',
    class: 'text-destructive',
    onClick: (row) => decide(row.id, 'rejected'),
  },
]

const columns: ColumnDef<Features, AdoptionApplicationDto>[] = [
  {
    id: 'pet',
    header: 'Pet',
    cell: ({ row }) =>
      h(
        'button',
        {
          type: 'button',
          class: 'text-left font-medium hover:underline',
          onClick: () => navigateTo(`/admin/pets/${row.original.petId}`),
        },
        row.original.pet?.name ?? '—',
      ),
  },
  {
    id: 'adopter',
    header: 'Adotante',
    cell: ({ row }) =>
      h('div', [
        h('div', row.original.adopter?.name ?? '—'),
        h(
          'div',
          { class: 'text-muted-foreground text-xs' },
          row.original.adopter?.email ?? '',
        ),
      ]),
  },
  {
    id: 'contact',
    header: 'Contato',
    cell: ({ row }) => row.original.contactPhone ?? '—',
  },
  {
    id: 'message',
    header: 'Mensagem',
    meta: { class: 'max-w-xs' },
    cell: ({ row }) =>
      row.original.message
        ? h(
            'span',
            {
              class: 'block max-w-xs truncate',
              title: row.original.message,
            },
            row.original.message,
          )
        : h('span', { class: 'text-muted-foreground' }, '—'),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) =>
      h(
        'span',
        {
          class: `rounded-full px-2 py-0.5 text-xs font-medium ${
            statusClass[row.original.status] ?? 'bg-muted'
          }`,
        },
        applicationStatusLabel(row.original.status),
      ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Enviada em',
    meta: { class: 'whitespace-nowrap' },
    cell: ({ row }) => formatDateTime(row.original.createdAt),
  },
  {
    accessorKey: 'reviewedAt',
    header: 'Analisada em',
    meta: { class: 'whitespace-nowrap' },
    cell: ({ row }) => formatDateTime(row.original.reviewedAt),
  },
  {
    id: 'actions',
    header: 'Ações',
    meta: { class: 'w-32 text-center whitespace-nowrap' },
    cell: ({ row }) =>
      row.original.status === 'pending'
        ? h(DataTableRowActions as Component, { row: row.original, actions })
        : h('span', { class: 'text-muted-foreground text-xs' }, 'Analisada'),
  },
]
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Candidaturas de adoção</h1>
    </div>

    <div class="grid grid-cols-2 gap-4 @4xl/main:grid-cols-4">
      <Card
        v-for="card in statCards"
        :key="card.key"
        role="button"
        tabindex="0"
        :aria-pressed="statusFilter === card.key"
        class="from-primary/5 to-card dark:bg-card @container/card cursor-pointer bg-gradient-to-t shadow-xs transition-colors hover:border-primary/40"
        :class="
          statusFilter === card.key ? 'border-primary ring-1 ring-primary' : ''
        "
        @click="statusFilter = card.key"
        @keydown.enter.prevent="statusFilter = card.key"
        @keydown.space.prevent="statusFilter = card.key"
      >
        <CardHeader>
          <CardDescription>{{ card.label }}</CardDescription>
          <CardTitle
            class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl"
          >
            {{ card.value }}
          </CardTitle>
          <CardAction>
            <component :is="card.icon" class="size-5" :class="card.iconClass" />
          </CardAction>
        </CardHeader>
        <CardFooter class="text-muted-foreground text-sm">
          {{ card.hint }}
        </CardFooter>
      </Card>
    </div>

    <div class="flex justify-start">
      <div class="w-full sm:w-72">
        <Input v-model="search" placeholder="Buscar por adotante ou pet..." />
      </div>
    </div>

    <DataTable
      :columns="columns"
      :data="data?.items ?? []"
      selection="none"
      :get-row-id="(row) => row.id"
      :is-loading="isLoading"
    >
      <template #empty>Nenhuma candidatura.</template>
    </DataTable>

    <Pagination
      v-if="data"
      :page="data.page"
      :page-size="data.pageSize"
      :total="data.total"
      @update:page="page = $event"
    />
  </div>
</template>
