<script setup lang="ts">
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Heart,
  ImageIcon,
  PawPrint,
} from '@lucide/vue'
import PetGalleryDialog from '@/components/PetGalleryDialog.vue'
import useDialog from '@/composables/useDialog'

const props = defineProps<{ appliedPetIds?: Set<string> }>()
const isApplied = (pet: PetDto) => props.appliedPetIds?.has(pet.id) ?? false

const placeholder = '/images/aumigo/pet-placeholder.jpeg'

const cardClasses = [
  'bg-cream-soft lg:-rotate-2',
  'bg-[#e8e2f2] lg:rotate-2',
  'bg-[#f6d8c9] lg:-rotate-2',
]
const badgeClasses = ['bg-cream-soft', 'bg-[#e8e2f2]', 'bg-[#f6d8c9]']
const articleArticle: Record<PetDto['sex'], string> = {
  male: 'o ',
  female: 'a ',
  unknown: '',
}

const { data } = usePublicPetsQuery(() => ({ pageSize: 4 }))

const pets = computed(() => data.value?.items ?? [])
const hasPets = computed(() => pets.value.length > 0)

function coverUrl(pet: PetDto) {
  return pet.images[0]?.url ?? placeholder
}

function metaLine(pet: PetDto) {
  return [
    petSexLabel(pet.sex),
    petAgeLabel(pet.birthDate),
    pet.size ? `Porte ${petSizeLabel(pet.size)}` : null,
  ]
    .filter(Boolean)
    .join(' · ')
}

const { startApplication } = useAdoptionFlow()
const dialog = useDialog()
const { revealHeading, revealGroup } = useScrollReveal()

function openGallery(pet: PetDto) {
  dialog.open(PetGalleryDialog, {
    dialogProps: {
      class:
        'max-w-[calc(100%-2rem)] p-0 bg-white text-forest border-brand sm:max-w-2xl',
      showCloseButton: false,
    },
    props: { pet },
  })
}

const trailTitle = ref<HTMLElement | null>(null)
const petCards = ref<HTMLElement[]>([])

let revealed = false

function setupReveal() {
  if (revealed || !hasPets.value) return
  revealed = true
  nextTick(() => {
    revealHeading(trailTitle.value)
    for (const card of petCards.value) {
      const parts = card.querySelectorAll<HTMLElement>('[data-reveal]')
      revealGroup(Array.from(parts), { y: 40, stagger: 0.14 })
    }
    if (import.meta.client) ScrollTrigger.refresh()
  })
}

onMounted(() => {
  watch(hasPets, setupReveal, { immediate: true })
})
</script>

<template>
  <!-- Trilha de encontros (pets do banco) -->
  <section v-if="hasPets" class="px-6 pb-20 pt-22 md:px-10 lg:px-20">
    <div class="mx-auto flex max-w-6xl flex-col items-center gap-14">
      <div class="flex flex-col items-center gap-4 text-center">
        <span class="text-[11px] font-semibold tracking-[1.6px] text-forest">
          UM ENCONTRO PODE MUDAR TUDO
        </span>
        <h2
          ref="trailTitle"
          data-reveal-heading
          class="max-w-180 text-[34px] font-medium leading-[1.15] tracking-[-1.8px] text-forest md:text-[44px]"
        >
          Pequenas patas.<br >Grandes histórias de amor.
        </h2>
        <p class="max-w-157.5 text-[17px] leading-[1.6] text-text-soft">
          Cada jeitinho é único. Conheça personalidades que podem combinar com a
          sua e imagine uma vida juntos.
        </p>
      </div>

      <div class="relative w-full py-4">
        <LandingPawTrail />
        <div
          class="relative z-10 flex flex-col gap-16 pr-12 sm:pr-16 lg:gap-22 lg:pr-0"
        >
          <article
            v-for="(pet, i) in pets"
            :key="pet.id"
            ref="petCards"
            class="flex flex-col items-center gap-10 lg:gap-44"
            :class="i % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'"
          >
            <div data-reveal class="flex w-full justify-center lg:w-113.75">
              <div
                class="w-full max-w-110 rounded-[24px] p-3"
                :class="cardClasses[i % cardClasses.length]"
              >
                <div class="relative overflow-hidden rounded-[16px]">
                  <img
                    :src="coverUrl(pet)"
                    :alt="pet.name"
                    class="aspect-416/370 w-full object-cover"
                  >
                  <div
                    class="absolute right-4 top-4 flex size-10 items-center justify-center rounded-[20px] bg-white"
                  >
                    <Heart
                      class="size-5"
                      :class="
                        isApplied(pet)
                          ? 'fill-red-500 text-red-500'
                          : 'text-forest'
                      "
                    />
                  </div>
                </div>
                <div class="flex items-center justify-between px-2 pb-1.5 pt-3">
                  <span class="text-[13px] text-forest">{{ pet.name }}</span>
                  <PawPrint class="size-4.5 text-forest" />
                </div>
              </div>
            </div>

            <div
              data-reveal
              class="flex w-full max-w-110 flex-col gap-4.5 lg:w-110"
            >
              <div class="flex items-center gap-3">
                <h3
                  class="text-[34px] font-medium tracking-[-1.5px] text-forest md:text-[38px]"
                >
                  {{ pet.name }}
                </h3>
                <span
                  v-if="pet.species"
                  class="rounded-full px-3 py-1.5 text-[12px] text-forest"
                  :class="badgeClasses[i % badgeClasses.length]"
                >
                  {{ pet.species.name }}
                </span>
              </div>
              <p v-if="metaLine(pet)" class="text-[13px] text-text-soft">
                {{ metaLine(pet) }}
              </p>
              <p
                v-if="pet.description"
                class="text-[15px] leading-[1.6] text-text-soft"
              >
                {{ pet.description }}
              </p>
              <div class="mt-1 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  :disabled="isApplied(pet)"
                  class="inline-flex h-12 w-fit items-center gap-3 rounded-xl bg-forest px-5.5 text-[14px] font-semibold text-white transition-colors"
                  :class="
                    isApplied(pet)
                      ? 'pointer-events-none opacity-60'
                      : 'hover:bg-forest/90'
                  "
                  @click="startApplication({ id: pet.id, name: pet.name })"
                >
                  <template v-if="isApplied(pet)">
                    Candidatura já enviada
                    <Check class="size-4.5" />
                  </template>
                  <template v-else>
                    Quero conhecer {{ articleArticle[pet.sex] }}{{ pet.name }}
                    <ArrowUpRight class="size-4.5" />
                  </template>
                </button>
                <button
                  v-if="pet.images.length"
                  type="button"
                  class="inline-flex h-12 w-fit items-center gap-2.5 rounded-xl border border-brand bg-white px-5 text-[14px] font-semibold text-forest transition-colors hover:bg-cream-soft"
                  @click="openGallery(pet)"
                >
                  <ImageIcon class="size-4.5" />
                  Ver fotos
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>

      <div class="flex flex-col items-center gap-3.5">
        <NuxtLink
          to="/pets"
          class="inline-flex h-12 items-center gap-3 rounded-xl border border-brand bg-white px-5.5 text-[14px] font-semibold text-forest transition-colors hover:bg-cream-soft"
        >
          Ver todos os pets
          <ArrowRight class="size-4.5" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
