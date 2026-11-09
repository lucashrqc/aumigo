<script setup lang="ts">
import { computed, ref } from 'vue'
import { ImageIcon, X } from '@lucide/vue'
import useDialog from '@/composables/useDialog'
import type { CarouselApi } from '@/components/ui/carousel'
import type { PetImageDto } from '#shared/types'

const props = defineProps<{
  pet: {
    name: string
    birthDate?: string | null
    size?: 'small' | 'medium' | 'large' | null
    images?: PetImageDto[]
  }
}>()

const { close } = useDialog()

const placeholder = '/images/aumigo/pet-placeholder.jpeg'

const images = computed(() => props.pet.images ?? [])
const hasImages = computed(() => images.value.length > 0)
const total = computed(() => images.value.length)

const current = ref(1)
function onInitApi(api: CarouselApi) {
  if (!api) return
  current.value = api.selectedScrollSnap() + 1
  api.on('select', () => {
    current.value = api.selectedScrollSnap() + 1
  })
}

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
          Um pouco mais de {{ pet.name }}
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

    <Carousel
      v-if="hasImages"
      class="w-full"
      :opts="{ loop: total > 1 }"
      @init-api="onInitApi"
    >
      <CarouselContent>
        <CarouselItem v-for="img in images" :key="img.id">
          <img
            :src="img.url"
            :alt="pet.name"
            class="aspect-square w-full rounded-[16px] object-cover sm:aspect-4/3"
          >
        </CarouselItem>
      </CarouselContent>

      <span
        class="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[12px] font-medium text-forest shadow-sm"
      >
        {{ current }} de {{ total }}
      </span>

      <template v-if="total > 1">
        <CarouselPrevious
          class="left-4 size-10 border-none bg-white/90 text-forest shadow-sm hover:bg-white"
        />
        <CarouselNext
          class="right-4 size-10 border-none bg-white/90 text-forest shadow-sm hover:bg-white"
        />
      </template>
    </Carousel>

    <div
      v-else
      class="flex aspect-square w-full items-center justify-center rounded-[16px] bg-cream-soft text-text-soft sm:aspect-4/3"
    >
      <img
        :src="placeholder"
        :alt="pet.name"
        class="aspect-square w-full rounded-[16px] object-cover sm:aspect-4/3"
      >
    </div>

    <div class="flex items-center gap-3">
      <img
        :src="images[0]?.url ?? placeholder"
        :alt="pet.name"
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
        {{ pet.name }} • Galeria de fotos
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
