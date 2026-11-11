<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight, Heart } from '@lucide/vue'

definePageMeta({ layout: 'public', middleware: 'auth' })
useHead({ title: 'Minhas candidaturas — Aumigo' })
useSeoMeta({ robots: 'noindex, nofollow' })

const { data, isLoading } = useMyApplicationsQuery()

const applications = computed(() => data.value ?? [])
const count = computed(() => applications.value.length)
const countLabel = computed(() =>
  count.value === 1
    ? '1 candidatura enviada'
    : `${count.value} candidaturas enviadas`,
)
</script>

<template>
  <div class="flex flex-col gap-8">
    <section class="relative -mt-8 ml-[calc(50%-50vw)] w-screen bg-cream-soft">
      <div class="container mx-auto px-4">
        <div class="mx-auto max-w-5xl py-12 md:py-14">
          <span
            class="text-[11px] font-semibold tracking-[1.6px] text-forest/70"
          >
            SEU CAMINHO ATÉ UM NOVO AMOR
          </span>
          <h1
            class="mt-3 text-[32px] font-semibold leading-[1.1] tracking-[-1px] text-forest md:text-[40px]"
          >
            Minhas candidaturas de adoção
          </h1>
          <p class="mt-3 max-w-xl text-[16px] text-text-soft">
            Cada candidatura é o começo de uma história cheia de carinho.
          </p>
          <p v-if="!isLoading" class="mt-5 text-[13px] text-text-soft">
            {{ countLabel }}
          </p>
        </div>
      </div>
    </section>

    <div class="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <div v-if="isLoading" class="flex flex-col gap-5">
        <Skeleton v-for="n in 2" :key="n" class="h-56 w-full rounded-[20px]" />
      </div>

      <div
        v-else-if="!count"
        class="flex flex-col items-center gap-4 rounded-[20px] border border-brand/40 bg-white px-8 py-16 text-center"
      >
        <div
          class="flex size-14 items-center justify-center rounded-full bg-cream-soft text-forest"
        >
          <Heart class="size-6" />
        </div>
        <p class="text-[16px] text-text-soft">
          Você ainda não se candidatou a nenhum pet.
        </p>
        <NuxtLink
          to="/pets"
          class="inline-flex h-11 items-center gap-2 rounded-xl bg-forest px-5 text-[14px] font-semibold text-white transition-colors hover:bg-forest/90"
        >
          Conhecer pets
          <ArrowRight class="size-4" />
        </NuxtLink>
      </div>

      <template v-else>
        <AdoptionApplicationCard
          v-for="app in applications"
          :key="app.id"
          :application="app"
        />
      </template>

      <section
        v-if="!isLoading"
        class="flex flex-col items-start justify-between gap-4 rounded-[20px] bg-cream-soft px-8 py-6 sm:flex-row sm:items-center"
      >
        <div class="flex items-center gap-3">
          <Heart class="size-5 text-forest" />
          <div class="flex flex-col">
            <span class="text-[15px] font-semibold text-forest">
              Uma nova história está a caminho.
            </span>
            <span class="text-[13px] text-text-soft">
              Enquanto isso, conheça outros pets que também esperam por um lar.
            </span>
          </div>
        </div>
        <NuxtLink
          to="/pets"
          class="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border border-brand bg-white px-5 text-[14px] font-semibold text-forest transition-colors hover:bg-white/70"
        >
          Conhecer pets
          <ArrowRight class="size-4" />
        </NuxtLink>
      </section>
    </div>
  </div>
</template>
<style>
img {
  transform: translateZ(0);
}
img {
  image-rendering: -webkit-optimize-contrast;
}
</style>
