<script setup lang="ts">
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import AdoptionGuideDialog from '@/components/AdoptionGuideDialog.vue'
import useDialog from '@/composables/useDialog'
import { useAuthStore } from '@/stores/auth'
import {
  ArrowUpRight,
  Check,
  Heart,
  House,
  MessagesSquare,
  Minus,
  PawPrint,
  Plus,
  Search,
} from '@lucide/vue'

definePageMeta({ layout: false })
useHead({ title: 'Aumigo — Adoção de pets' })

const auth = useAuthStore()
const appliedPetIds = useAppliedPetIds()
const dialog = useDialog()
const logout = useLogout()

function openAdoptionGuide() {
  dialog.open(AdoptionGuideDialog, {
    dialogProps: {
      class:
        'max-w-[calc(100%-2rem)] gap-0 overflow-hidden p-0 bg-white text-forest border-brand sm:max-w-4xl',
      showCloseButton: false,
    },
  })
}

const principles = [
  'Cada pet tem sua história',
  'Toda conexão tem seu tempo',
  'Adotar é cuidar por toda a vida',
]

const steps = [
  {
    icon: Search,
    number: '01',
    title: 'Encontre sua conexão',
    body: 'Explore os perfis e conheça a história, o personalidade e as necessidades de cada pet.',
  },
  {
    icon: MessagesSquare,
    number: '02',
    title: 'Converse com quem cuida',
    body: 'Crie sua conta, demonstre interesse e tire suas dúvidas com o responsável pela adoção.',
  },
  {
    icon: House,
    number: '03',
    title: 'Prepare um novo começo',
    body: 'Combine o encontro, conheça as etapas da adoção e prepare a casa para receber seu amigo.',
  },
]

const essentials = [
  {
    title: 'Tempo e presença',
    body: 'Passeios, brincadeiras e paciência na adaptação.',
  },
  {
    title: 'Cuidado e planejamento',
    body: 'Alimentação, vacinas e acompanhamento veterinário.',
  },
  {
    title: 'Segurança e respeito',
    body: 'Ambiente protegido e carinho pelo jeito de cada pet.',
  },
]

const faqs = [
  {
    q: 'Como faço para adotar pela Aumigo?',
    a: 'Comece pelos perfis e escolha um pet que combine com você. Depois, crie sua conta e entre em contato com o responsável para conversar, conhecer o pet e entender as próximas etapas da adoção.',
  },
  {
    q: 'Preciso criar uma conta para adotar?',
    a: 'Sim. A conta é gratuita e permite demonstrar interesse, conversar com o responsável pelo pet e acompanhar o andamento da sua adoção.',
  },
  {
    q: 'Como sei se um pet combina com a minha rotina?',
    a: 'Cada perfil traz o personalidade, o nível de energia e os cuidados necessários. Compare com o seu dia a dia e converse com o responsável para tirar dúvidas antes de decidir.',
  },
  {
    q: 'Posso conhecer o pet antes da adoção?',
    a: 'Pode, e recomendamos. Combine um encontro com o responsável para conhecer o pet pessoalmente e sentir como é a conexão de vocês.',
  },
  {
    q: 'Como funciona a adaptação no novo lar?',
    a: 'Cada pet tem seu tempo. Ofereça um ambiente tranquilo, respeite o ritmo dele e conte com paciência e carinho nas primeiras semanas.',
  },
]

const faqValue = ref('faq-0')

useLenisScroll()
const { revealHeading } = useScrollReveal()

const ready = ref(false)
const heroTitle = ref<HTMLElement | null>(null)
const adoptTitle = ref<HTMLElement | null>(null)
const respTitle = ref<HTMLElement | null>(null)
const faqTitle = ref<HTMLElement | null>(null)
const ctaTitle = ref<HTMLElement | null>(null)

onMounted(() => {
  ready.value = true
  for (const heading of [
    heroTitle,
    adoptTitle,
    respTitle,
    faqTitle,
    ctaTitle,
  ]) {
    revealHeading(heading.value)
  }
})
</script>

<template>
  <div class="bg-white text-forest" :class="{ 'landing-anim-ready': ready }">
    <!-- <ClientOnly>
      <LandingPawCursor />
    </ClientOnly> -->

    <!-- Navegação -->
    <header class="px-6 md:px-10 lg:px-20">
      <div
        class="mx-auto flex h-22 max-w-7xl items-center justify-between lg:h-26"
      >
        <NuxtLink to="/" class="flex items-center gap-2.5">
          <PawPrint class="size-7 text-forest" />
          <span class="text-[30px] tracking-[-1.4px] text-forest">Aumigo</span>
        </NuxtLink>

        <nav class="hidden items-center gap-8 text-[14px] text-forest lg:flex">
          <NuxtLink to="/pets" class="transition-opacity hover:opacity-70">
            Encontre um pet
          </NuxtLink>
          <a href="#como-adotar" class="transition-opacity hover:opacity-70"
            >Como adotar</a
          >
          <a
            href="#adocao-responsavel"
            class="transition-opacity hover:opacity-70"
          >
            Adoção responsável
          </a>
        </nav>

        <div class="flex items-center gap-4 lg:gap-6">
          <template v-if="auth.isAuthenticated">
            <NuxtLink
              to="/applications"
              class="hidden text-[14px] font-medium text-forest sm:block"
            >
              Minhas candidaturas
            </NuxtLink>
            <NuxtLink
              v-if="auth.isStaff"
              to="/admin"
              class="hidden text-[14px] font-medium text-forest sm:block"
            >
              Admin
            </NuxtLink>
            <button
              type="button"
              class="inline-flex h-8 items-center rounded-lg bg-forest px-5.5 text-[14px] font-semibold text-white transition-colors hover:bg-forest/90"
              @click="logout()"
            >
              Sair
            </button>
          </template>
          <template v-else>
            <NuxtLink
              to="/login"
              class="hidden text-[14px] font-medium text-forest sm:block"
            >
              Entrar
            </NuxtLink>
            <NuxtLink
              to="/register"
              class="inline-flex h-8 items-center rounded-lg bg-forest px-5.5 text-[14px] font-semibold text-white transition-colors hover:bg-forest/90"
            >
              Criar conta
            </NuxtLink>
          </template>
        </div>
      </div>
    </header>

    <!-- Herói -->
    <section class="px-6 pb-16 pt-6 md:px-10 lg:px-20">
      <div
        class="mx-auto flex max-w-7xl flex-col items-center gap-12 lg:flex-row lg:gap-16"
      >
        <div class="flex w-full flex-col gap-7 lg:w-143">
          <div class="flex items-center gap-2.5">
            <span class="h-px w-6 bg-forest" />
            <span
              class="text-[11px] font-semibold tracking-[1.6px] text-forest"
            >
              CONEXÕES QUE TRANSFORMAM
            </span>
          </div>
          <h1
            ref="heroTitle"
            data-reveal-heading
            class="text-[44px] font-medium leading-[1.08] tracking-[-2px] text-forest sm:text-[56px] lg:text-[68px] lg:tracking-[-3px]"
          >
            Seu próximo amor tem quatro patas.
          </h1>
          <p class="max-w-117.5 text-[18px] leading-[1.65] text-text-soft">
            Um novo começo para eles. Uma vida com mais amor para você. Encontre
            um companheiro para dividir os pequenos e os grandes momentos.
          </p>
          <div class="flex flex-wrap gap-3">
            <NuxtLink
              to="/pets"
              class="inline-flex h-12 items-center gap-3 rounded-xl bg-forest px-5.5 text-[14px] font-semibold text-white transition-colors hover:bg-forest/90"
            >
              Quero encontrar um pet
              <ArrowUpRight class="size-4.5" />
            </NuxtLink>
            <a
              href="#como-adotar"
              class="inline-flex h-12 items-center rounded-xl border border-brand bg-white px-5.5 text-[14px] font-semibold text-forest transition-colors hover:bg-cream-soft"
            >
              Como funciona
            </a>
          </div>
          <div class="flex items-center gap-2">
            <Heart class="size-4 text-text-soft" />
            <span class="text-[13px] text-text-soft">
              Encontros com carinho. Adoção com responsabilidade.
            </span>
          </div>
        </div>

        <div class="relative w-full max-w-140 lg:flex-1">
          <div
            class="absolute inset-x-5 top-2 bottom-0 rounded-b-[32px] rounded-t-[180px] bg-cream-soft"
          />
          <div
            class="relative mx-auto aspect-528/550 w-full max-w-132 overflow-hidden rounded-b-[20px] rounded-t-[170px]"
          >
            <img
              src="/images/aumigo/dog-cat-home.avif"
              alt="Um cão e um gato juntos em casa"
              class="h-full w-full object-cover"
            >
          </div>
          <div
            class="absolute right-2 top-6 flex size-30 rotate-12 items-center justify-center rounded-full bg-[#f6d8c9] p-4 text-center lg:right-6"
          >
            <p class="text-[15px] font-medium leading-[1.3] text-forest">
              Mais afeto, mais ronrons, mais aumor.
            </p>
          </div>
          <div
            class="absolute -left-1 bottom-4 flex items-center gap-3 rounded-[24px] border border-brand bg-white px-6 py-4.5 lg:bottom-16"
          >
            <Heart class="size-5.5 text-forest" />
            <span class="text-[15px] font-medium text-forest"
              >O amor encontra um lar.</span
            >
          </div>
        </div>
      </div>
    </section>

    <!-- Princípios -->
    <section class="bg-cream-soft px-6 py-5 md:px-10 lg:px-24">
      <div
        class="mx-auto flex max-w-312 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div
          v-for="item in principles"
          :key="item"
          class="flex items-center gap-3"
        >
          <PawPrint class="size-4.5 shrink-0 text-forest" />
          <span class="text-[14px] text-forest">{{ item }}</span>
        </div>
      </div>
    </section>

    <LandingPetTrail :applied-pet-ids="appliedPetIds" />

    <!-- Como adotar -->
    <section
      id="como-adotar"
      class="bg-cream-soft px-6 py-16 md:px-10 lg:px-24 lg:py-20"
    >
      <div class="mx-auto flex max-w-312 flex-col items-center gap-12">
        <div class="flex flex-col items-center gap-4 text-center">
          <span class="text-[11px] font-semibold tracking-[1.6px] text-forest">
            DO PRIMEIRO OI AO NOVO LAR
          </span>
          <h2
            ref="adoptTitle"
            data-reveal-heading
            class="max-w-180 text-[34px] font-medium leading-[1.15] tracking-[-1.8px] text-forest md:text-[44px]"
          >
            O caminho é mais simples juntos.
          </h2>
          <p class="max-w-157.5 text-[17px] leading-[1.6] text-text-soft">
            A Aumigo aproxima você de quem está esperando um lar. Cada adoção
            acontece com conversa, cuidado e tempo.
          </p>
        </div>
        <div class="grid w-full gap-12 md:grid-cols-3">
          <div
            v-for="step in steps"
            :key="step.number"
            class="flex flex-col gap-5"
          >
            <div class="flex items-center justify-between">
              <div
                class="flex size-14 items-center justify-center rounded-[18px] bg-white"
              >
                <component :is="step.icon" class="size-6.25 text-forest" />
              </div>
              <span class="text-[14px] text-text-soft">{{ step.number }}</span>
            </div>
            <div class="flex flex-col gap-3">
              <h3 class="text-[22px] font-medium tracking-[-0.6px] text-forest">
                {{ step.title }}
              </h3>
              <p class="text-[15px] leading-[1.65] text-text-soft">
                {{ step.body }}
              </p>
            </div>
          </div>
        </div>
        <p class="text-center text-[12px] text-text-soft">
          Cada responsável pode ter critérios e etapas próprios. Combine todos
          os detalhes antes de adotar.
        </p>
      </div>
    </section>

    <!-- Adoção responsável -->
    <section
      id="adocao-responsavel"
      class="px-6 py-16 md:px-10 lg:px-24 lg:py-22"
    >
      <div
        class="mx-auto flex max-w-312 flex-col gap-10 lg:flex-row lg:items-center lg:gap-20"
      >
        <div class="flex flex-col gap-6 lg:w-123">
          <span class="text-[11px] font-semibold tracking-[1.6px] text-forest">
            CARINHO TAMBÉM É COMPROMISSO
          </span>
          <h2
            ref="respTitle"
            data-reveal-heading
            class="text-[34px] font-medium leading-[1.15] tracking-[-1.7px] text-forest md:text-[44px]"
          >
            Mais que abrir a porta.<br >É abrir espaço na vida.
          </h2>
          <p class="text-[16px] leading-[1.65] text-text-soft">
            Adotar é acolher uma vida com tudo o que ela precisa. Antes do
            encontro, pense no que você pode oferecer todos os dias — por muitos
            anos.
          </p>
          <button
            type="button"
            class="inline-flex h-12 w-fit items-center gap-3 rounded-xl border border-brand bg-white px-5.5 text-[14px] font-semibold text-forest transition-colors hover:bg-cream-soft"
            @click="openAdoptionGuide"
          >
            Quero me preparar para adotar
            <ArrowUpRight class="size-4.5" />
          </button>
        </div>
        <div
          class="flex flex-1 flex-col gap-6 rounded-[24px] bg-sage p-6 md:p-8"
        >
          <h3 class="text-[20px] font-medium text-forest">
            Um lar pronto para acolher tem…
          </h3>
          <div
            v-for="item in essentials"
            :key="item.title"
            class="flex gap-3.5"
          >
            <Check class="mt-0.5 size-5 shrink-0 text-forest" />
            <div class="flex flex-col gap-1.5">
              <span class="text-[16px] font-medium text-forest">{{
                item.title
              }}</span>
              <span class="text-[14px] leading-normal text-text-soft">{{
                item.body
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Dúvidas frequentes -->
    <section id="duvidas" class="px-6 pb-20 pt-10 md:px-10 lg:px-24">
      <div class="mx-auto flex max-w-312 flex-col gap-12 lg:flex-row lg:gap-24">
        <div class="flex flex-col gap-5 lg:w-99">
          <span class="text-[11px] font-semibold tracking-[1.6px] text-forest">
            PODE PERGUNTAR
          </span>
          <h2
            ref="faqTitle"
            data-reveal-heading
            class="text-[34px] font-medium leading-[1.15] tracking-[-1.8px] text-forest md:text-[44px]"
          >
            Todo começo<br >vem com dúvidas.
          </h2>
          <p class="text-[16px] leading-[1.6] text-text-soft">
            E tudo bem. O importante é dar esse passo com informação e
            tranquilidade.
          </p>
        </div>
        <Accordion v-model="faqValue" type="single" collapsible class="flex-1">
          <AccordionItem
            v-for="(faq, i) in faqs"
            :key="faq.q"
            :value="`faq-${i}`"
            class="border-sage-line last:border-b"
            :class="{ 'border-t': i === 0 }"
          >
            <AccordionTrigger
              class="items-center gap-5 py-5.5 text-[15px] font-medium text-forest hover:no-underline md:text-[16px]"
            >
              {{ faq.q }}
              <template #icon>
                <component
                  :is="faqValue === `faq-${i}` ? Minus : Plus"
                  class="size-4.5 shrink-0 text-forest transition-transform duration-200"
                />
              </template>
            </AccordionTrigger>
            <AccordionContent
              class="pb-5.5 text-[15px] leading-[1.7] text-text-soft"
            >
              {{ faq.a }}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>

    <!-- Convite para começar -->
    <section class="bg-forest px-6 py-14 md:px-10 lg:px-30 lg:py-16">
      <div
        class="mx-auto flex max-w-300 flex-col items-center gap-10 lg:flex-row lg:gap-20"
      >
        <div
          class="w-55 shrink-0 overflow-hidden rounded-b-[24px] rounded-t-[110px] lg:w-65.5"
        >
          <img
            src="/images/aumigo/carinho.avif"
            alt="Pessoa fazendo carinho em um cão"
            class="aspect-square w-full object-cover"
          >
        </div>
        <div
          class="flex flex-1 flex-col items-center gap-5 text-center lg:items-start lg:text-left"
        >
          <span class="text-[11px] font-semibold tracking-[1.6px] text-brand">
            UM LAR MUDA TUDO
          </span>
          <h2
            ref="ctaTitle"
            data-reveal-heading
            class="text-[34px] font-medium leading-[1.15] tracking-[-1.8px] text-white md:text-[46px]"
          >
            Tem um novo melhor amigo esperando pelo seu oi.
          </h2>
          <p class="text-[16px] leading-normal text-cream-soft">
            O próximo capítulo dessa história pode começar com você.
          </p>
          <NuxtLink
            to="/pets"
            class="inline-flex h-12 items-center gap-3 rounded-xl bg-cream-soft px-5.5 text-[14px] font-semibold text-forest transition-opacity hover:opacity-90"
          >
            Encontrar meu novo amor
            <ArrowUpRight class="size-4.5" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Rodapé -->
    <LandingFooter />
  </div>
</template>
