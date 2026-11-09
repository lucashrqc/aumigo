<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight, Check, Heart, ImageIcon } from '@lucide/vue'
import PetGalleryDialog from '@/components/PetGalleryDialog.vue'
import useDialog from '@/composables/useDialog'
import type { AdoptionApplicationDto } from '#shared/types'

definePageMeta({ layout: 'public', middleware: 'auth' })
useHead({ title: 'Minhas candidaturas — Aumigo' })
useSeoMeta({ robots: 'noindex, nofollow' })

const { data, isLoading } = useMyApplicationsQuery()

const dialog = useDialog()

const placeholder = '/images/aumigo/pet-placeholder.jpeg'

const applications = computed(() => data.value ?? [])
const count = computed(() => applications.value.length)
const countLabel = computed(() =>
  count.value === 1
    ? '1 candidatura enviada'
    : `${count.value} candidaturas enviadas`,
)

const statusVariant = (s: string) =>
  s === 'approved' ? 'success' : s === 'rejected' ? 'destructive' : 'warning'

const coverUrl = (app: AdoptionApplicationDto) =>
  app.pet?.images?.[0]?.url ?? placeholder

const metaLine = (app: AdoptionApplicationDto) =>
  [
    petAgeLabel(app.pet?.birthDate),
    app.pet?.size ? `Porte ${petSizeLabel(app.pet.size)}` : null,
  ]
    .filter(Boolean)
    .join(' · ')

function openGallery(app: AdoptionApplicationDto) {
  if (!app.pet) return
  dialog.open(PetGalleryDialog, {
    dialogProps: {
      class:
        'max-w-[calc(100%-2rem)] p-0 bg-white text-forest border-brand sm:max-w-2xl',
      showCloseButton: false,
    },
    props: { pet: app.pet },
  })
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <section
      class="relative -mt-8 ml-[calc(50%-50vw)] w-screen bg-cream-soft"
    >
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
        <article
          v-for="app in applications"
          :key="app.id"
          class="rounded-[20px] border border-brand/40 bg-white p-6"
        >
          <div class="flex flex-col gap-6 sm:flex-row">
            <div class="flex w-full shrink-0 flex-col gap-3 sm:w-48">
              <img
                :src="coverUrl(app)"
                :alt="app.pet?.name ?? 'Pet'"
                class="aspect-square w-full rounded-[16px] object-cover"
              >
              <Button
                variant="outline"
                class="w-full border-brand text-forest hover:bg-cream-soft"
                :disabled="!app.pet?.images?.length"
                @click="openGallery(app)"
              >
                <ImageIcon class="size-4" />
                Ver galeria
              </Button>
            </div>

            <div class="flex min-w-0 flex-1 flex-col gap-3">
              <div class="flex items-start justify-between gap-4">
                <div class="flex flex-col gap-1">
                  <NuxtLink
                    :to="`/pets/${app.petId}`"
                    class="text-[24px] font-semibold tracking-[-0.5px] text-forest hover:underline"
                  >
                    {{ app.pet?.name ?? 'Pet' }}
                  </NuxtLink>
                  <p v-if="metaLine(app)" class="text-[14px] text-text-soft">
                    {{ metaLine(app) }}
                  </p>
                </div>
                <Badge
                  :variant="statusVariant(app.status)"
                  class="shrink-0 gap-1.5 px-3.5 py-1.5 text-[13px] font-medium [&>svg]:size-4"
                >
                  <Check v-if="app.status === 'approved'" />
                  {{ applicationStatusLabel(app.status) }}
                </Badge>
              </div>

              <p v-if="app.pet?.description" class="text-[15px] text-text-soft">
                {{ app.pet.description }}
              </p>

              <p class="text-[13px] text-text-soft">
                Enviada em {{ formatDate(app.createdAt) }}
              </p>

              <div v-if="app.pet?.vaccines?.length" class="flex flex-col gap-2">
                <span
                  class="text-[11px] font-semibold uppercase tracking-[1px] text-forest/60"
                >
                  Vacinas recebidas
                </span>
                <div class="flex flex-wrap gap-2">
                  <Badge
                    v-for="vaccine in app.pet.vaccines"
                    :key="vaccine.id"
                    class="border-none bg-cream-soft text-forest"
                  >
                    {{ vaccine.name }}
                  </Badge>
                </div>
              </div>

              <div
                v-if="app.message"
                class="rounded-[14px] bg-cream-soft/60 px-4 py-3"
              >
                <span
                  class="text-[11px] font-semibold uppercase tracking-[1px] text-forest/60"
                >
                  Sua mensagem
                </span>
                <p class="mt-1 text-[14px] text-text-soft">{{ app.message }}</p>
              </div>

              <p class="mt-1 text-[12px] text-text-soft/80">
                Confirme os dados e as vacinas com o responsável.
              </p>
            </div>
          </div>
        </article>
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
