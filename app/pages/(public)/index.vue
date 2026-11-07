<script setup lang="ts">
import { PawPrint } from '@lucide/vue'

definePageMeta({ layout: 'public' })
useHead({ title: 'Aumor — Adoção de pets' })

const { data } = usePublicPetsQuery(() => ({ pageSize: 3 }))
</script>

<template>
  <div>
    <section class="flex flex-col items-center gap-6 py-12 text-center">
      <PawPrint class="h-12 w-12" />
      <h1 class="text-4xl font-bold tracking-tight">
        Encontre seu novo melhor amigo
      </h1>
      <p class="max-w-prose text-muted-foreground">
        A Aumor conecta pets resgatados a lares acolhedores. Veja os animais à
        espera de adoção e envie uma candidatura — nossa equipe analisa cada
        solicitação.
      </p>
      <Button as-child size="lg"
        ><NuxtLink to="/pets">Ver pets</NuxtLink></Button
      >
    </section>

    <section v-if="data?.items?.length" class="mt-8">
      <h2 class="mb-4 text-xl font-semibold">Adicionados recentemente</h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <PetCard v-for="pet in data.items" :key="pet.id" :pet="pet" />
      </div>
    </section>
  </div>
</template>
