<script setup lang="ts">
import BarChart from '@/components/charts/BarChart.vue'
import DataTableRowActions from '@/components/DataTableRowActions.vue'
import type { Features } from '@/components/features'
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FileText, Heart, PawPrint, Search, Syringe } from '@lucide/vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { EChartsOption } from 'echarts'
import { h, type Component } from 'vue'
import { presetRange, type DateRange } from '@/utils/date-range'

definePageMeta({ layout: 'private', middleware: 'staff' })
useHead({ title: 'Admin — Aumor' })

const range = ref<DateRange>(presetRange('last-12-months'))
const speciesId = ref<string | null>(null)
const species = useSpeciesOptions()

const filters = computed(() => ({
  from: range.value.from,
  to: range.value.to,
  speciesId: speciesId.value ?? undefined,
}))

const { data: analytics, isLoading: analyticsLoading } = useAdminAnalyticsQuery(
  () => filters.value,
)
const { data: pets, isLoading: petsLoading } = useAdminPetsQuery(() => ({
  page: 1,
  pageSize: 10,
  ...filters.value,
}))

const statCards = computed(() => [
  {
    key: 'adopted',
    label: 'Adotados',
    value: analytics.value?.cards.adopted ?? 0,
    icon: Heart,
    iconClass: 'text-green-400',
    hint: 'Pets adotados no período',
  },
  {
    key: 'available',
    label: 'Disponíveis',
    value: analytics.value?.cards.available ?? 0,
    icon: PawPrint,
    iconClass: 'text-amber-400',
    hint: 'Pets publicados no período',
  },
  {
    key: 'pending',
    label: 'Candidaturas pendentes',
    value: analytics.value?.cards.pendingApplications ?? 0,
    icon: FileText,
    iconClass: 'text-indigo-400',
    hint: 'Candidaturas abertas no período',
  },
  {
    key: 'vaccinated',
    label: 'Vacinados',
    value: analytics.value?.cards.vaccinated ?? 0,
    icon: Syringe,
    iconClass: 'text-sky-400',
    hint: 'Pets com ao menos 1 vacina',
  },
])

const monthAbbr = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
]
function formatMonth(ym: string) {
  const [year, month] = ym.split('-')
  return `${monthAbbr[Number(month) - 1]}/${year?.slice(2)}`
}

const chartOptions = computed<EChartsOption>(() => ({
  xAxis: {
    type: 'category',
    axisLabel: { formatter: (value: string) => formatMonth(String(value)) },
  },
  yAxis: { type: 'value', minInterval: 1 },
  series: [
    { name: 'Cadastrados', encode: { x: 'month', y: 'created' } },
    { name: 'Adotados', encode: { x: 'month', y: 'adopted' } },
  ],
}))

const actions: RowAction<PetDto>[] = [
  {
    label: 'Ver',
    icon: Search,
    onClick: (row) => navigateTo(`/admin/pets/${row.id}`),
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
    meta: { class: 'w-16 text-center whitespace-nowrap' },
    cell: ({ row }) =>
      h(DataTableRowActions as Component, { row: row.original, actions }),
  },
]
</script>

<template>
  <div class="flex flex-col gap-4 md:gap-6">
    <div
      class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <h1 class="text-2xl font-bold">Dashboard</h1>
      <div class="flex flex-wrap items-center gap-2">
        <DateFilter v-model="range" />
        <div class="w-48">
          <AsyncCombobox
            v-model="speciesId"
            :items="species.items"
            :is-fetching="species.isFetching"
            :is-fetching-next-page="species.isFetchingNextPage"
            :has-next-page="species.hasNextPage"
            :resolve-by-id="species.resolveById"
            clearable
            option-value="id"
            option-label="name"
            placeholder="Todas as espécies"
            search-placeholder="Buscar espécie…"
            @search="species.setSearch"
            @can-load-more="species.loadMore"
          />
        </div>
      </div>
    </div>

    <div
      class="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4"
    >
      <Card
        v-for="card in statCards"
        :key="card.key"
        class="from-primary/5 to-card dark:bg-card @container/card bg-linear-to-t shadow-xs"
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

    <Card class="pt-0">
      <CardHeader class="border-b py-5">
        <CardTitle>Pets por mês</CardTitle>
        <CardDescription>Cadastrados e adotados no período</CardDescription>
      </CardHeader>
      <CardFooter class="px-2 pt-4 pb-4 sm:px-6">
        <BarChart
          :dataset="analytics?.petsPerMonth ?? []"
          :options="chartOptions"
          :loading="analyticsLoading"
          class="aspect-auto h-[300px] w-full"
        />
      </CardFooter>
    </Card>

    <div class="flex flex-col gap-2">
      <h2 class="text-lg font-semibold">Últimos pets cadastrados</h2>
      <DataTable
        :columns="columns"
        :data="pets?.items ?? []"
        selection="none"
        :get-row-id="(row) => row.id"
        :is-loading="petsLoading"
      />
    </div>
  </div>
</template>
