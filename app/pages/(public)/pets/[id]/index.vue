<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

definePageMeta({ layout: 'public' })

const route = useRoute()
const auth = useAuthStore()
const id = computed(() => route.params.id as string)

const {
  data: pet,
  status,
  error,
} = await useFetch<PetDto>(() => `/api/pets/${id.value}`)
const isLoading = computed(() => status.value === 'pending')
const displayName = computed(() => petDisplayName(pet.value))

useSeoMeta({
  title: () => (pet.value ? `${displayName.value} — Aumigo` : 'Pet — Aumigo'),
  description: () =>
    pet.value?.description ||
    'Conheça este pet disponível para adoção na Aumigo.',
  ogTitle: () => (pet.value ? `${displayName.value} — Aumigo` : 'Pet — Aumigo'),
  ogDescription: () => pet.value?.description || undefined,
  ogImage: () => pet.value?.images?.[0]?.url,
})

if (pet.value) {
  useSchemaOrg([
    defineProduct({
      name: petDisplayName(pet.value),
      description: pet.value.description ?? undefined,
      image: pet.value.images?.map((img) => img.url) ?? [],
      offers: [
        {
          price: 0,
          priceCurrency: 'BRL',
          availability:
            pet.value.status === 'available' ? 'InStock' : 'SoldOut',
        },
      ],
    }),
  ])
}

const { startApplication } = useAdoptionFlow()
</script>

<template>
  <div v-if="isLoading" class="text-muted-foreground">Carregando…</div>
  <div v-else-if="error || !pet" class="text-muted-foreground">
    Pet não encontrado.
  </div>

  <div v-else class="grid gap-8 lg:grid-cols-2">
    <div class="space-y-3">
      <div class="aspect-video w-full overflow-hidden rounded-lg bg-muted">
        <img
          v-if="pet.images?.[0]"
          :src="pet.images[0].url"
          :alt="displayName"
          class="h-full w-full object-cover"
        >
        <div
          v-else
          class="flex h-full items-center justify-center text-muted-foreground"
        >
          Sem foto
        </div>
      </div>
      <div v-if="pet.images.length > 1" class="grid grid-cols-4 gap-2">
        <img
          v-for="img in pet.images.slice(1)"
          :key="img.id"
          :src="img.url"
          :alt="displayName"
          class="aspect-square w-full rounded object-cover"
        >
      </div>
    </div>

    <div class="space-y-4">
      <div class="flex items-center gap-3">
        <h1 class="text-3xl font-bold">{{ displayName }}</h1>
        <Badge :variant="pet.status === 'available' ? 'outline' : 'secondary'">
          {{ petStatusLabel(pet.status) }}
        </Badge>
      </div>

      <dl class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div>
          <dt class="text-muted-foreground">Espécie</dt>
          <dd>{{ pet.species?.name ?? '—' }}</dd>
        </div>
        <div>
          <dt class="text-muted-foreground">Raça</dt>
          <dd>{{ pet.breed?.name ?? 'Vira-lata / desconhecida' }}</dd>
        </div>
        <div>
          <dt class="text-muted-foreground">Sexo</dt>
          <dd>{{ petSexLabel(pet.sex) }}</dd>
        </div>
        <div>
          <dt class="text-muted-foreground">Porte</dt>
          <dd>{{ petSizeLabel(pet.size) }}</dd>
        </div>
        <div v-if="pet.coat">
          <dt class="text-muted-foreground">Pelagem</dt>
          <dd>{{ pet.coat }}</dd>
        </div>
        <div>
          <dt class="text-muted-foreground">Castrado</dt>
          <dd>{{ pet.neutered ? 'Sim' : 'Não' }}</dd>
        </div>
        <div>
          <dt class="text-muted-foreground">Peso</dt>
          <dd>{{ pet.weight ? `${pet.weight} kg` : '—' }}</dd>
        </div>
      </dl>

      <p v-if="pet.description" class="whitespace-pre-line text-sm">
        {{ pet.description }}
      </p>
      <p
        v-if="pet.specialNeeds"
        class="rounded-md bg-amber-50 p-3 text-sm text-amber-900"
      >
        <strong>Necessidades especiais:</strong> {{ pet.specialNeeds }}
      </p>

      <div v-if="pet.status === 'adopted'" class="text-muted-foreground">
        Este pet já encontrou um lar. 🎉
      </div>
      <div v-else-if="!auth.isStaff">
        <Button
          size="lg"
          @click="startApplication({ id: pet.id, name: displayName })"
        >
          Candidatar-se para adotar
        </Button>
      </div>
    </div>
  </div>
</template>
