<script setup lang="ts">
import AdoptionApplicationDetailsDialog from '@/components/AdoptionApplicationDetailsDialog.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import DataTableRowActions from '@/components/DataTableRowActions.vue'
import type { Features } from '@/components/features'
import {
  Ban,
  Check,
  CircleCheck,
  CircleSlash,
  ClipboardList,
  Clock,
  Eye,
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
const { mutateAsync: cancelApplication } = useCancelApplication()

const dialog = useDialog()

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

async function handleCancel(row: AdoptionApplicationDto) {
  const ok = await dialog.open<boolean>(ConfirmDialog, {
    dialogProps: { class: 'max-w-md' },
    props: {
      title: 'Cancelar candidatura',
      icon: Ban,
      description: `Cancelar a candidatura de ${row.adopter?.name ?? 'adotante'} para ${row.pet?.name ?? 'o pet'}? O pet voltará a ficar disponível e as candidaturas rejeitadas serão reabertas.`,
      confirmText: 'Cancelar candidatura',
      destructive: true,
    },
  })
  if (!ok) return
  try {
    await cancelApplication(row.id)
    toast.success('Candidatura cancelada')
  } catch (err) {
    toast.error(
      resolveErrorMessage(err, 'Não foi possível cancelar a candidatura'),
    )
  }
}

const statusClass: Record<string, string> = {
  approved:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  rejected: 'bg-destructive/10 text-destructive',
  pending:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  canceled: 'bg-muted text-muted-foreground',
}

function openDetails(row: AdoptionApplicationDto) {
  dialog.open(AdoptionApplicationDetailsDialog, {
    dialogProps: { class: 'max-w-2xl' },
    props: { application: row },
  })
}

const actions: RowAction<AdoptionApplicationDto>[] = [
  {
    label: 'Ver detalhes',
    icon: Eye,
    iconClass: 'h-4 w-4',
    onClick: (row) => openDetails(row),
  },
  {
    label: 'Aprovar',
    icon: Check,
    iconClass: 'h-4 w-4 text-emerald-600',
    hidden: (row) => row.status !== 'pending',
    onClick: (row) => decide(row.id, 'approved'),
  },
  {
    label: 'Rejeitar',
    icon: X,
    iconClass: 'h-4 w-4',
    class: 'text-destructive',
    hidden: (row) => row.status !== 'pending',
    onClick: (row) => decide(row.id, 'rejected'),
  },
  {
    label: 'Cancelar',
    icon: Ban,
    iconClass: 'h-4 w-4',
    class: 'text-destructive',
    hidden: (row) => row.status !== 'approved',
    onClick: (row) => handleCancel(row),
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
    id: 'age',
    header: 'Idade',
    cell: ({ row }) => `${row.original.age} anos`,
  },
  {
    id: 'home',
    header: 'Moradia',
    cell: ({ row }) => homeLabel(row.original.home),
  },
  {
    id: 'address',
    header: 'Endereço',
    meta: { class: 'max-w-xs' },
    cell: ({ row }) => {
      const a = row.original
      const text =
        [a.street, a.number].filter(Boolean).join(', ') +
        (a.city ? ` · ${a.city.name}${a.city.state ? `/${a.city.state.uf}` : ''}` : '')
      return h(
        'span',
        { class: 'block max-w-xs truncate', title: text },
        text || '—',
      )
    },
  },
  {
    id: 'isRental',
    header: 'Aluguel?',
    cell: ({ row }) => yesNoLabel(row.original.isRental),
  },
  {
    id: 'firstPet',
    header: '1º pet?',
    cell: ({ row }) => yesNoLabel(row.original.firstPet),
  },
  {
    id: 'hasFinancialConditions',
    header: 'Condições?',
    cell: ({ row }) => yesNoLabel(row.original.hasFinancialConditions),
  },
  {
    id: 'enclosureType',
    header: 'Vedação',
    meta: { class: 'max-w-xs' },
    cell: ({ row }) => {
      const list = row.original.enclosureType ?? []
      if (!list.length) return h('span', { class: 'text-muted-foreground' }, '—')
      const text = list.map((v) => enclosureTypeLabel(v)).join(', ')
      return h('span', { class: 'block max-w-xs truncate', title: text }, text)
    },
  },
  {
    id: 'acceptedTerms',
    header: 'Termos',
    cell: ({ row }) => yesNoLabel(row.original.acceptedTerms),
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
    accessorKey: 'rejectedAt',
    header: 'Rejeitada em',
    meta: { class: 'whitespace-nowrap' },
    cell: ({ row }) => formatDateTime(row.original.rejectedAt),
  },
  {
    accessorKey: 'canceledAt',
    header: 'Cancelada em',
    meta: { class: 'whitespace-nowrap' },
    cell: ({ row }) => formatDateTime(row.original.canceledAt),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: {
      class:
        'bg-background md:sticky md:right-32 md:z-10 md:border-l md:shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.12)]',
    },
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
    id: 'actions',
    header: 'Ações',
    meta: {
      class:
        'w-32 bg-background text-center whitespace-nowrap md:sticky md:right-0 md:z-10',
    },
    cell: ({ row }) =>
      h(DataTableRowActions as Component, { row: row.original, actions }),
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
