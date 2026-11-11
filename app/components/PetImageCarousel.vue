<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CarouselApi } from '@/components/ui/carousel'
import type { PetImageDto } from '#shared/types'

const props = withDefaults(
  defineProps<{
    images: PetImageDto[]
    alt: string
    aspectClass?: string
    placeholder?: string
  }>(),
  {
    aspectClass: 'aspect-square',
    placeholder: '/images/aumigo/pet-placeholder.jpeg',
  },
)

const imgs = computed(() => props.images ?? [])
const hasImages = computed(() => imgs.value.length > 0)
const total = computed(() => imgs.value.length)

const current = ref(1)
function onInitApi(api: CarouselApi) {
  if (!api) return
  current.value = api.selectedScrollSnap() + 1
  api.on('select', () => {
    current.value = api.selectedScrollSnap() + 1
  })
}
</script>

<template>
  <Carousel
    v-if="hasImages"
    class="w-full"
    :opts="{ loop: total > 1 }"
    @init-api="onInitApi"
  >
    <CarouselContent>
      <CarouselItem v-for="img in imgs" :key="img.id">
        <img
          :src="img.url"
          :alt="alt"
          :class="['w-full rounded-[16px] object-cover', aspectClass]"
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
    :class="[
      'flex w-full items-center justify-center rounded-[16px] bg-cream-soft',
      aspectClass,
    ]"
  >
    <img
      :src="placeholder"
      :alt="alt"
      :class="['w-full rounded-[16px] object-cover', aspectClass]"
    >
  </div>
</template>
