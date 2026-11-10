<script setup lang="ts">
import { computed } from 'vue'
import { ImageIcon } from '@lucide/vue'
import PetGalleryDialog from '@/components/PetGalleryDialog.vue'
import useDialog from '@/composables/useDialog'
import type { PetImageDto, PetVaccineDto } from '#shared/types'

type PetCardPet = {
  id: string
  name: string
  description?: string | null
  size?: 'small' | 'medium' | 'large' | null
  birthDate?: string | null
  images?: PetImageDto[]
  vaccines?: PetVaccineDto[]
}

const props = defineProps<{ pet: PetCardPet }>()

const dialog = useDialog()

const placeholder = '/images/aumigo/pet-placeholder.jpeg'

const coverUrl = computed(() => props.pet.images?.[0]?.url ?? placeholder)

const metaLine = computed(() =>
  [
    petAgeLabel(props.pet.birthDate),
    props.pet.size ? `Porte ${petSizeLabel(props.pet.size)}` : null,
  ]
    .filter(Boolean)
    .join(' · '),
)

function openGallery() {
  dialog.open(PetGalleryDialog, {
    dialogProps: {
      class:
        'max-w-[calc(100%-2rem)] p-0 bg-white text-forest border-brand sm:max-w-2xl',
      showCloseButton: false,
    },
    props: { pet: props.pet },
  })
}
</script>

<template>
  <article class="rounded-[20px] border border-brand/40 bg-white p-6">
    <div class="flex flex-col gap-6 sm:flex-row">
      <div class="flex w-full shrink-0 flex-col gap-3 sm:w-48">
        <img
          :src="coverUrl"
          :alt="pet.name"
          class="aspect-square w-full rounded-[16px] object-cover"
        >
        <Button
          variant="outline"
          class="w-full border-brand text-forest hover:bg-cream-soft"
          :disabled="!pet.images?.length"
          @click="openGallery"
        >
          <ImageIcon class="size-4" />
          Ver galeria
        </Button>
      </div>

      <div class="flex min-w-0 flex-1 flex-col gap-3">
        <div class="flex items-start justify-between gap-4">
          <div class="flex flex-col gap-1">
            <NuxtLink
              :to="`/pets/${pet.id}`"
              class="text-[24px] font-semibold tracking-[-0.5px] text-forest hover:underline"
            >
              {{ pet.name }}
            </NuxtLink>
            <p v-if="metaLine" class="text-[14px] text-text-soft">
              {{ metaLine }}
            </p>
          </div>
          <slot name="status" />
        </div>

        <p v-if="pet.description" class="text-[15px] text-text-soft">
          {{ pet.description }}
        </p>

        <div v-if="pet.vaccines?.length" class="flex flex-col gap-2">
          <span
            class="text-[11px] font-semibold uppercase tracking-[1px] text-forest/60"
          >
            Vacinas recebidas
          </span>
          <div class="flex flex-wrap gap-2">
            <Badge
              v-for="vaccine in pet.vaccines"
              :key="vaccine.id"
              class="border-none bg-cream-soft text-forest"
            >
              {{ vaccine.name }}
            </Badge>
          </div>
        </div>

        <slot />
      </div>
    </div>
  </article>
</template>
