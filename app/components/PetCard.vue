<script setup lang="ts">
import { computed } from 'vue'
import { ArrowUpRight, PawPrint } from '@lucide/vue'
import PetGalleryDialog from '@/components/PetGalleryDialog.vue'
import useDialog from '@/composables/useDialog'
import type { PetDto } from '#shared/types'

const props = defineProps<{ pet: PetDto }>()

const sexArticle: Record<PetDto['sex'], string> = {
  male: 'o ',
  female: 'a ',
  unknown: '',
}

const ageSizeLine = computed(() =>
  [
    petAgeLabel(props.pet.birthDate),
    props.pet.size ? `Porte ${petSizeLabel(props.pet.size)}` : null,
  ]
    .filter(Boolean)
    .join(' · '),
)

const timeInAdoption = computed(() =>
  petTimeInAdoptionLabel(props.pet.publishedAt),
)

const { startApplication } = useAdoptionFlow()
const dialog = useDialog()

function openGallery(event: MouseEvent) {
  if ((event.target as HTMLElement).closest('button')) return
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
  <article class="flex h-full flex-col overflow-hidden rounded-[28px] bg-white">
    <div class="bg-cream-soft p-3 rounded-[16px]">
      <div class="cursor-pointer" @click="openGallery">
        <PetImageCarousel
          :images="pet.images"
          :alt="pet.name"
          aspect-class="aspect-4/3"
        />
      </div>

      <div class="flex items-baseline justify-between gap-2 px-2 pb-1 pt-3">
        <div class="flex min-w-0 items-baseline gap-2">
          <span class="shrink-0 text-[16px] font-semibold text-forest">
            {{ pet.name }}
          </span>
          <span v-if="ageSizeLine" class="truncate text-[13px] text-text-soft">
            {{ ageSizeLine }}
          </span>
        </div>
        <PawPrint class="size-4.5 shrink-0 self-center text-forest" />
      </div>
    </div>

    <div class="flex flex-1 flex-col gap-3 p-4 pt-3">
      <div
        v-if="pet.species || pet.vaccines?.length"
        class="flex flex-wrap gap-2"
      >
        <Badge v-if="pet.species" class="border-none bg-forest text-white">
          {{ pet.species.name }}
        </Badge>
        <Badge
          v-for="vaccine in pet.vaccines"
          :key="vaccine.id"
          class="border-none bg-cream-soft text-forest"
        >
          {{ vaccine.name }}
        </Badge>
      </div>

      <p
        v-if="pet.description"
        class="line-clamp-2 text-[14px] leading-normal text-text-soft"
      >
        {{ pet.description }}
      </p>

      <p v-if="timeInAdoption" class="text-[13px] font-medium text-forest">
        {{ timeInAdoption }}
      </p>

      <button
        type="button"
        class="mt-auto inline-flex h-11 items-center justify-center gap-2.5 rounded-xl bg-forest px-5 text-[14px] font-semibold text-white transition-colors hover:bg-forest/90"
        @click="startApplication({ id: pet.id, name: pet.name })"
      >
        Quero conhecer {{ sexArticle[pet.sex] }}{{ pet.name }}
        <ArrowUpRight class="size-4.5 shrink-0" />
      </button>
    </div>
  </article>
</template>
