<script setup lang="ts">
import { computed } from 'vue'
import { ImageIcon, X } from '@lucide/vue'
import useDialog from '@/composables/useDialog'
import type { PetImageDto } from '#shared/types'

const props = defineProps<{
  pet: {
    name?: string | null
    coat?: string | null
    birthDate?: string | null
    size?: 'small' | 'medium' | 'large' | null
    images?: PetImageDto[]
  }
}>()

const displayName = computed(() => petDisplayName(props.pet))

const { close } = useDialog()

const placeholder = '/images/aumigo/pet-placeholder.jpeg'

const images = computed(() => props.pet.images ?? [])
const total = computed(() => images.value.length)

const meta = computed(() =>
  [
    petAgeLabel(props.pet.birthDate),
    props.pet.size ? `Porte ${petSizeLabel(props.pet.size)}` : null,
  ]
    .filter(Boolean)
    .join(' · '),
)

const photoCountLabel = computed(() =>
  total.value === 1 ? '1 foto disponível' : `${total.value} fotos disponíveis`,
)
</script>

<template>
  <div class="flex flex-col gap-5 p-4 text-forest sm:p-6">
    <div class="flex items-start justify-between gap-4">
      <div class="flex flex-col gap-1">
        <DialogTitle
          class="text-[22px] font-semibold tracking-[-0.5px] text-forest"
        >
          Um pouco mais de {{ displayName }}
        </DialogTitle>
        <DialogDescription v-if="meta" class="text-[14px] text-text-soft">
          {{ meta }}
        </DialogDescription>
      </div>
      <button
        type="button"
        aria-label="Fechar"
        class="flex size-10 shrink-0 items-center justify-center rounded-full bg-cream-soft text-forest transition-colors hover:bg-cream-soft/70"
        @click="close()"
      >
        <X class="size-5" />
      </button>
    </div>

    <PetImageCarousel
      :images="images"
      :alt="displayName"
      aspect-class="aspect-square sm:aspect-4/3"
    />

    <div class="flex items-center gap-3">
      <img
        :src="images[0]?.url ?? placeholder"
        :alt="displayName"
        class="size-12 rounded-[10px] border border-brand object-cover"
      >
      <div class="flex flex-col">
        <span class="text-[14px] font-medium text-forest">
          {{ photoCountLabel }}
        </span>
        <span class="text-[13px] text-text-soft">
          Conheça melhor esse novo companheiro.
        </span>
      </div>
    </div>

    <div
      class="flex items-center justify-between gap-4 border-t border-brand/40 pt-4"
    >
      <span class="flex items-center gap-2 text-[13px] text-text-soft">
        <ImageIcon class="size-4" />
        {{ displayName }} • Galeria de fotos
      </span>
      <Button
        variant="outline"
        class="border-brand text-forest hover:bg-cream-soft"
        @click="close()"
      >
        Fechar
      </Button>
    </div>
  </div>
</template>
