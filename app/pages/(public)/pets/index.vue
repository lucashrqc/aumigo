<script setup lang="ts">
import { Loader2Icon, PawPrint, SearchX } from '@lucide/vue'
import { useDebounceFn, useInfiniteScroll } from '@vueuse/core'

definePageMeta({ layout: 'public', footer: true })
useHead({ title: 'Adote um pet — Aumigo' })

const search = ref('')
const debouncedSearch = ref('')
const speciesFilter = ref('all')

const updateDebouncedSearch = useDebounceFn((value: string) => {
  debouncedSearch.value = value
}, 400)

watch(search, (value) => updateDebouncedSearch(value))

const { data: species } = useSpeciesQuery()
const params = computed(() => ({
  pageSize: 12,
  search: debouncedSearch.value || undefined,
  speciesId: speciesFilter.value === 'all' ? undefined : speciesFilter.value,
}))

const {
  data,
  isLoading,
  isFetching,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
} = usePublicPetsInfiniteQuery(params)

useLenisScroll()

const pets = computed(
  () => data.value?.pages.flatMap((page) => page.items) ?? [],
)

const hasActiveFilters = computed(
  () => !!search.value || speciesFilter.value !== 'all',
)

function clearFilters() {
  search.value = ''
  debouncedSearch.value = ''
  speciesFilter.value = 'all'
}

useInfiniteScroll(
  () => (import.meta.client ? window : null),
  () => {
    fetchNextPage()
  },
  {
    distance: 200,
    canLoadMore: () =>
      hasNextPage.value && !isFetching.value && !isFetchingNextPage.value,
  },
)
</script>

<template>
  <div class="flex flex-col gap-8">
    <section class="relative -mt-8 ml-[calc(50%-50vw)] w-screen bg-cream-soft">
      <div class="container mx-auto px-4">
        <div class="mx-auto max-w-7xl py-12 md:py-14">
          <span
            class="text-[11px] font-semibold tracking-[1.6px] text-forest/70"
          >
            ENCONTRE SEU NOVO MELHOR AMIGO
          </span>
          <h1
            class="mt-3 text-[32px] font-semibold leading-[1.1] tracking-[-1px] text-forest md:text-[40px]"
          >
            Adote um pet
          </h1>
          <p class="mt-3 max-w-xl text-[16px] text-text-soft">
            Conheça os pets que esperam por um lar cheio de carinho.
          </p>
        </div>
      </div>
    </section>

    <div
      class="relative isolate mx-auto flex min-h-[70vh] w-full max-w-7xl flex-col gap-6 overflow-hidden"
    >
      <PetsPawTrail />

      <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div class="flex-1">
          <Input
            id="search"
            v-model="search"
            placeholder="Buscar por nome..."
          />
        </div>
        <div class="w-full sm:w-56 space-y-1.5">
          <Select v-model="speciesFilter">
            <SelectTrigger
              ><SelectValue placeholder="Todas as espécies"
            /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as espécies</SelectItem>
              <SelectItem v-for="s in species ?? []" :key="s.id" :value="s.id">
                {{ s.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div
        v-if="isLoading"
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <Skeleton v-for="n in 8" :key="n" class="h-80 w-full rounded-[20px]" />
      </div>

      <div
        v-else-if="!pets.length"
        class="flex flex-1 flex-col items-center justify-center gap-5 rounded-[24px] border border-sage-line bg-sage px-8 py-20 text-center"
      >
        <div
          class="flex size-16 items-center justify-center rounded-full bg-white text-forest shadow-sm"
        >
          <component
            :is="hasActiveFilters ? SearchX : PawPrint"
            class="size-7"
          />
        </div>
        <div class="flex max-w-md flex-col gap-2">
          <p class="text-[18px] font-semibold tracking-[-0.3px] text-forest">
            {{
              hasActiveFilters
                ? 'Nenhum pet encontrado'
                : 'Ainda não há pets por aqui'
            }}
          </p>
          <p class="text-[14px] leading-[1.6] text-text-soft">
            {{
              hasActiveFilters
                ? 'Nenhum pet corresponde à sua busca no momento. Que tal ajustar os filtros e tentar de novo?'
                : 'Em breve novos amigos estarão esperando por um lar. Volte logo para conhecê-los.'
            }}
          </p>
        </div>
        <button
          v-if="hasActiveFilters"
          type="button"
          class="inline-flex h-11 items-center gap-2 rounded-xl bg-forest px-6 text-[14px] font-semibold text-white transition-colors hover:bg-forest/90"
          @click="clearFilters"
        >
          Limpar filtros
        </button>
      </div>

      <template v-else>
        <div
          class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <PetCard v-for="pet in pets" :key="pet.id" :pet="pet" />
        </div>

        <div v-if="isFetchingNextPage" class="flex justify-center py-6">
          <Loader2Icon class="size-5 animate-spin text-forest/60" />
        </div>
      </template>
    </div>
  </div>
</template>
