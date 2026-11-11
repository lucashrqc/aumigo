<script setup lang="ts">
import {
  ArrowRight,
  ArrowUpRight,
  Coffee,
  Heart,
  House,
  Moon,
  PawPrint,
  ShieldCheck,
  Stethoscope,
  Sun,
} from '@lucide/vue'

const pets = [
  {
    name: 'Bento',
    species: 'Cão',
    meta: 'Macho · 2 anos · Porte médio',
    tagline: ['Um parceiro para', 'todos os passeios.'],
    bio: 'Sou curioso, carinhoso e sempre topo uma voltinha. Depois, meu lugar preferido é pertinho de você.',
    caption: 'Especialista em abanar o rabo',
    cta: 'Quero conhecer o Bento',
    photo: '/images/aumigo/pet-bento.avif',
    cardClass: 'bg-cream-soft lg:-rotate-2',
    badgeClass: 'bg-cream-soft',
    reverse: false,
    traits: [
      {
        icon: Sun,
        title: 'Energia para brincar',
        detail: 'Gosta de passeios e atividades todos os dias.',
      },
      {
        icon: Heart,
        title: 'Companheiro e sociável',
        detail: 'Adora gente e a companhia de outros cães.',
      },
      {
        icon: ShieldCheck,
        title: 'Cuidados em dia',
        detail: 'Castrado, vacinado e vermifugado.',
      },
    ],
  },
  {
    name: 'Amora',
    species: 'Gata',
    meta: 'Fêmea · 3 anos · Porte pequeno',
    tagline: ['Seu sofá acaba', 'de ganhar companhia.'],
    bio: 'Tenho meu tempo para confiar. Mas, quando me sinto em casa, retribuo com ronrons e longas sonecas ao seu lado.',
    caption: 'Ronrons são minha linguagem do amor',
    cta: 'Quero conhecer a Amora',
    photo: '/images/aumigo/pet-amora.avif',
    cardClass: 'bg-[#e8e2f2] lg:rotate-2',
    badgeClass: 'bg-[#e8e2f2]',
    reverse: true,
    traits: [
      {
        icon: Moon,
        title: 'Tranquila e observadora',
        detail: 'Prefere uma rotina calma, com cantinhos ao sol.',
      },
      {
        icon: House,
        title: 'Uma casa segura',
        detail: 'Precisa de janelas teladas e vida dentro de casa.',
      },
      {
        icon: ShieldCheck,
        title: 'Cuidados em dia',
        detail: 'Castrada, vacinada e vermifugada.',
      },
    ],
  },
  {
    name: 'Chico',
    species: 'Cão',
    meta: 'Macho · 8 anos · Porte pequeno',
    tagline: ['Amor não tem', 'idade para começar.'],
    bio: 'Troco a pressa por um bom cafuné. Procuro um lar tranquilo para aproveitar a vida com calma e muito carinho.',
    caption: 'Cafuné nunca é demais',
    cta: 'Quero conhecer o Chico',
    photo: '/images/aumigo/pet-chico.avif',
    cardClass: 'bg-[#f6d8c9] lg:-rotate-2',
    badgeClass: 'bg-[#f6d8c9]',
    reverse: false,
    traits: [
      {
        icon: Coffee,
        title: 'Ritmo mais tranquilo',
        detail: 'Caminhadas leves e boas pausas para descansar.',
      },
      {
        icon: Heart,
        title: 'Carinhoso e apegado',
        detail: 'Ama estar perto e receber um bom cafuné.',
      },
      {
        icon: Stethoscope,
        title: 'Atenção na melhor idade',
        detail: 'Precisa de acompanhamento veterinário regular.',
      },
    ],
  },
]

const { startApplication } = useAdoptionFlow()
const { revealHeading, revealGroup } = useScrollReveal()

const trailTitle = ref<HTMLElement | null>(null)
const petCards = ref<HTMLElement[]>([])

onMounted(() => {
  revealHeading(trailTitle.value)
  for (const card of petCards.value) {
    const parts = card.querySelectorAll<HTMLElement>('[data-reveal]')
    revealGroup(Array.from(parts), { y: 40, stagger: 0.14 })
  }
})
</script>

<template>
  <!-- Trilha de encontros -->
  <section class="px-6 pb-20 pt-22 md:px-10 lg:px-20">
    <div class="mx-auto flex max-w-6xl flex-col items-center gap-12">
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
        <div class="flex flex-wrap justify-center gap-2 pt-2">
          <span
            class="rounded-full border border-forest bg-forest px-5 py-2.5 text-[13px] font-medium text-white"
          >
            Todos os pets
          </span>
          <span
            class="rounded-full border border-brand bg-white px-5 py-2.5 text-[13px] font-medium text-forest"
          >
            Cães
          </span>
          <span
            class="rounded-full border border-brand bg-white px-5 py-2.5 text-[13px] font-medium text-forest"
          >
            Gatos
          </span>
        </div>
      </div>

      <div class="relative w-full py-4">
        <LandingPawTrail />
        <div
          class="relative z-10 flex flex-col gap-16 pr-12 sm:pr-16 lg:gap-22 lg:pr-0"
        >
          <article
            v-for="pet in pets"
            :key="pet.name"
            ref="petCards"
            class="flex flex-col items-center gap-10 lg:gap-44"
            :class="pet.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'"
          >
            <div data-reveal class="flex w-full justify-center lg:w-113.75">
              <div
                class="w-full max-w-110 rounded-[24px] p-3"
                :class="pet.cardClass"
              >
                <div class="relative overflow-hidden rounded-[16px]">
                  <img
                    :src="pet.photo"
                    :alt="pet.name"
                    class="aspect-416/370 w-full object-cover"
                  >
                  <div
                    class="absolute right-4 top-4 flex size-10 items-center justify-center rounded-[20px] bg-white"
                  >
                    <Heart class="size-5 text-forest" />
                  </div>
                </div>
                <div class="flex items-center justify-between px-2 pb-1.5 pt-3">
                  <span class="text-[13px] text-forest">{{ pet.caption }}</span>
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
                  class="rounded-full px-3 py-1.5 text-[12px] text-forest"
                  :class="pet.badgeClass"
                >
                  {{ pet.species }}
                </span>
              </div>
              <p class="text-[13px] text-text-soft">{{ pet.meta }}</p>
              <div
                class="text-[26px] font-medium leading-[1.2] tracking-[-0.8px] text-forest md:text-[28px]"
              >
                <span v-for="line in pet.tagline" :key="line" class="block">{{
                  line
                }}</span>
              </div>
              <p class="text-[15px] leading-[1.6] text-text-soft">
                {{ pet.bio }}
              </p>
              <div class="flex flex-col gap-3.5 py-1">
                <div
                  v-for="trait in pet.traits"
                  :key="trait.title"
                  class="flex gap-3"
                >
                  <div
                    class="flex size-8.5 shrink-0 items-center justify-center rounded-[10px] bg-sage"
                  >
                    <component :is="trait.icon" class="size-4.5 text-forest" />
                  </div>
                  <div class="flex flex-col gap-1">
                    <span class="text-[14px] font-medium text-forest">{{
                      trait.title
                    }}</span>
                    <span class="text-[13px] leading-[1.4] text-text-soft">{{
                      trait.detail
                    }}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                class="inline-flex h-12 w-fit items-center gap-3 rounded-xl bg-forest px-5.5 text-[14px] font-semibold text-white transition-colors hover:bg-forest/90"
                @click="startApplication({ name: pet.name })"
              >
                {{ pet.cta }}
                <ArrowUpRight class="size-4.5" />
              </button>
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
        <p class="max-w-prose text-center text-[12px] text-text-soft">
          Perfis ilustrativos. A disponibilidade e os cuidados são confirmados
          com o responsável.
        </p>
      </div>
    </div>
  </section>
</template>
