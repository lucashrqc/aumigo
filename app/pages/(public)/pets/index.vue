<script setup lang="ts">
definePageMeta({ layout: 'public' })
useHead({ title: 'Adote um pet — Aumor' })

const search = ref('')
const speciesFilter = ref('all')
const page = ref(1)

const { data: species } = useSpeciesQuery()
const params = computed(() => ({
  page: page.value,
  pageSize: 12,
  search: search.value || undefined,
  speciesId: speciesFilter.value === 'all' ? undefined : speciesFilter.value,
}))
const { data, isLoading } = usePublicPetsQuery(params)

watch([search, speciesFilter], () => {
  page.value = 1
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div class="flex-1">
        <Label for="search">Buscar</Label>
        <Input id="search" v-model="search" placeholder="Buscar por nome..." />
      </div>
      <div class="w-full sm:w-56">
        <Label>Espécie</Label>
        <Select v-model="speciesFilter">
          <SelectTrigger><SelectValue placeholder="Todas as espécies" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as espécies</SelectItem>
            <SelectItem v-for="s in species ?? []" :key="s.id" :value="s.id">
              {{ s.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <p v-if="isLoading" class="text-muted-foreground">Carregando pets…</p>
    <p v-else-if="!data?.items.length" class="text-muted-foreground">
      Nenhum pet corresponde à sua busca no momento.
    </p>

    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <PetCard v-for="pet in data.items" :key="pet.id" :pet="pet" />
    </div>

    <Pagination
      v-if="data"
      :page="data.page"
      :page-size="data.pageSize"
      :total="data.total"
      @update:page="page = $event"
    />
  </div>
</template>
