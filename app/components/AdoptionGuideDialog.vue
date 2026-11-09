<script setup lang="ts">
import { Bone, ShieldCheck, Stethoscope, Syringe, X } from '@lucide/vue'
import useDialog from '@/composables/useDialog'

const { close } = useDialog()

const intro = [
  'Cães e gatos vivem atualmente em média 15 anos, então é importante lembrar que os cuidados são para a vida toda.',
  'Os animais também precisam de abrigo que proteja contra sol e chuva, além de água fresca à vontade.',
  'Deixar o cão preso o dia todo em correntes pode deixar o animal estressado e o levar à agressividade.',
]

const sections = [
  {
    icon: Bone,
    title: 'Alimentação',
    body: 'Cães e gatos necessitam de alimentação específica para cada espécie (um gato não é um cão pequeno), e pode variar de acordo com o porte e o tempo de vida (existe, por exemplo, ração específica para filhotes e para idosos). Gatos comem pequenas quantidades várias vezes ao dia, enquanto cães alimentam-se de porções maiores e menos frequentes.',
  },
  {
    icon: Syringe,
    title: 'Vacinação',
    body: 'Cães e gatos, assim como nós humanos, também precisam de vacinas para prevenir doenças. O protocolo vacinal começa quando filhote, e após isso são realizadas doses de reforço durante toda a vida. Passeios (especialmente em filhotes) são liberados apenas após o final do protocolo. A falta de vacinas pode não só transmitir doenças entre os gatos (panleucopenia, rinotraqueíte, calicivirose e clamidiose) e cães (parvovirose, cinomose, etc.), mas também entre os animais e humanos, sendo a raiva a mais importante, pois leva à morte em quase 100% dos casos. Os protocolos vacinais são individuais e devem ser elaborados e orientados por um médico veterinário de sua confiança.',
  },
  {
    icon: ShieldCheck,
    title: 'Antiparasitários',
    body: 'Os cães e gatos precisam de antiparasitários contra parasitas externos (como carrapatos, pulgas e ácaros) e internos contra verminoses. Além disso, os cães necessitam de repelentes que atuam na prevenção de zoonoses (leishmaniose visceral, dirofilariose).',
  },
]

const wellbeing = [
  'Lugar de animal é protegido no seu lar. Voltinhas sem supervisão podem deixar brechas para acidentes, envenenamentos, brigas e transmissão de doenças.',
  'Castração é a melhor opção para o controle populacional de cães e gatos. O procedimento cirúrgico deve ser realizado por médico veterinário em locais adequados.',
  'Alguns medicamentos humanos, alimentos e até plantas são tóxicos para cães e gatos. Muita atenção no que seu animalzinho brinca ou come (filhotes são mais curiosos, mas alguns adultos também).',
]
</script>

<template>
  <div class="flex max-h-[88vh] flex-col bg-white text-forest">
    <header
      class="flex items-start justify-between gap-4 border-b border-brand px-6 py-5 sm:px-8"
    >
      <div class="flex flex-col gap-1.5">
        <span class="text-[11px] font-semibold tracking-[1.6px] text-forest">
          ORIENTAÇÕES DE ADOÇÃO
        </span>
        <DialogTitle
          class="text-[22px] font-medium tracking-[-0.6px] text-forest sm:text-[26px]"
        >
          Acabou de adotar um bichinho?
        </DialogTitle>
        <DialogDescription class="text-[14px] leading-[1.5] text-text-soft">
          Algumas informações importantes sobre o manejo e a saúde do seu cão ou
          gato.
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
    </header>

    <div class="overflow-y-auto px-6 py-6 sm:px-8 sm:py-7">
      <div class="flex flex-col gap-7">
        <ul class="flex flex-col gap-3">
          <li
            v-for="item in intro"
            :key="item"
            class="flex gap-3 text-[15px] leading-[1.6] text-text-soft"
          >
            <span class="mt-2 size-1.5 shrink-0 rounded-full bg-forest" />
            <span>{{ item }}</span>
          </li>
        </ul>

        <div class="flex flex-col gap-5">
          <div
            v-for="section in sections"
            :key="section.title"
            class="flex gap-4 rounded-[18px] border border-sage-line bg-sage/40 p-5"
          >
            <div
              class="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-white"
            >
              <component :is="section.icon" class="size-5.5 text-forest" />
            </div>
            <div class="flex flex-col gap-1.5">
              <h3 class="text-[17px] font-medium text-forest">
                {{ section.title }}
              </h3>
              <p class="text-[14px] leading-[1.65] text-text-soft">
                {{ section.body }}
              </p>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-3">
            <Stethoscope class="size-5 shrink-0 text-forest" />
            <h3 class="text-[17px] font-medium text-forest">
              A saúde física é importante, assim como o bem-estar
            </h3>
          </div>
          <ul class="flex flex-col gap-3">
            <li
              v-for="item in wellbeing"
              :key="item"
              class="flex gap-3 text-[15px] leading-[1.6] text-text-soft"
            >
              <span class="mt-2 size-1.5 shrink-0 rounded-full bg-forest" />
              <span>{{ item }}</span>
            </li>
            <li class="flex gap-3 text-[15px] leading-[1.6] text-text-soft">
              <span class="mt-2 size-1.5 shrink-0 rounded-full bg-forest" />
              <span>
                A aplicação de anticoncepcionais
                <strong class="font-semibold text-forest"
                  >NÃO É INDICADA</strong
                >, e sua utilização pode levar ao surgimento de doenças graves
                que cursam para a morte.
              </span>
            </li>
          </ul>
        </div>

        <div class="rounded-[18px] bg-cream-soft px-5 py-5 sm:px-6">
          <p class="text-[15px] leading-[1.65] text-forest">
            Adoção é um ato de amor. A partir de agora seu animalzinho depende de
            você para uma nova caminhada de companheirismo, respeito e
            confiança.
          </p>
        </div>
      </div>
    </div>

    <footer
      class="flex flex-col gap-4 border-t border-brand px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8"
    >
      <div class="flex flex-col gap-0.5">
        <span class="text-[13px] text-text-soft">
          Para maiores dúvidas procure seu veterinário de confiança.
        </span>
        <span class="text-[13px] font-medium text-forest">
          Brenna Matias — CRMV-CE 2895
        </span>
      </div>
      <Button
        class="h-11 rounded-xl bg-forest px-6 text-[14px] font-semibold text-white hover:bg-forest/90"
        @click="close()"
      >
        Entendi
      </Button>
    </footer>
  </div>
</template>
