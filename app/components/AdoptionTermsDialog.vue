<script setup lang="ts">
import useDialog from '@/composables/useDialog'
import { Gavel, HeartHandshake, Info, X } from '@lucide/vue'
import { ref } from 'vue'

const props = withDefaults(defineProps<{ viewOnly?: boolean }>(), {
  viewOnly: false,
})

const { close } = useDialog()
const agreed = ref(false)

const commitments = [
  'Garantir o bem-estar deste animal, respeitando suas características e zelando pelas suas necessidades psicológicas e físicas;',
  'Garantir sua saúde física (fornecendo abrigo, alimento adequado, higiene, vacinas e levando-o regularmente ao veterinário), e sua saúde psicológica (respeitando suas características e fornecendo atenção, carinho, e a possibilidade de interagir com outras pessoas ou animais);',
  'Garantir sua segurança, mantendo-o sempre dentro de casa e fazendo passeios com coleira e guia (no caso de cães);',
  'Mantê-lo em ambiente limpo, arejado e espaçoso, com possibilidade de abrigo do sol ou chuva;',
  'Não mantê-lo preso em espaços pequenos ou em correntes;',
  'Garantir sua esterilização, processo sem contra-indicações que garante a redução de animais abandonados nas ruas;',
  'NUNCA e em nenhuma circunstância abandoná-lo na rua ou entregá-lo a um desconhecido;',
  'Devolvê-lo ao protetor responsável pela adoção se houver desistência;',
  'Comunicar qualquer outro destino que envolva o animal, tais como desaparecimento ou morte;',
  'Permitir a visita do protetor responsável pela adoção ou antigo dono até a completa adaptação do animal (6 meses).',
]

const awareness = [
  'Um cão ou gato pode viver até 15 anos ou mais, e durante todo este tempo serei responsável pelo seu bem-estar, principalmente durante sua velhice;',
  'O não cumprimento dos itens acima poderá ser interpretado como maus-tratos, o que acarretará a retirada do animal pelo doador responsável a qualquer tempo;',
]

const title = props.viewOnly ? '' : 'Antes de enviar sua candidatura'
const desc = props.viewOnly
  ? ''
  : 'Leia com atenção o termo de compromisso abaixo e confirme sua concordância para concluir o envio.'
</script>

<template>
  <div class="flex max-h-[88vh] flex-col bg-white text-forest">
    <header
      class="flex items-start justify-between gap-4 border-b border-brand px-6 py-5 sm:px-8"
    >
      <div class="flex flex-col gap-1.5">
        <span class="text-[11px] font-semibold tracking-[1.6px] text-forest">
          TERMOS DE ADOÇÃO RESPONSÁVEL
        </span>
        <DialogTitle
          class="text-[22px] font-medium tracking-[-0.6px] text-forest sm:text-[26px]"
        >
          {{ title }}
        </DialogTitle>
        <DialogDescription class="text-[14px] leading-[1.5] text-text-soft">
          {{ desc }}
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
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-3">
            <HeartHandshake class="size-5 shrink-0 text-forest" />
            <h3 class="text-[17px] font-medium text-forest">Me comprometo a</h3>
          </div>
          <ol class="flex flex-col gap-3">
            <li
              v-for="(item, index) in commitments"
              :key="index"
              class="flex gap-3.5 rounded-[14px] border border-sage-line bg-sage/40 px-4 py-3.5"
            >
              <span
                class="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-[13px] font-semibold text-forest"
              >
                {{ index + 1 }}
              </span>
              <span class="pt-0.5 text-[14px] leading-[1.6] text-text-soft">
                {{ item }}
              </span>
            </li>
          </ol>
        </div>

        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-3">
            <Info class="size-5 shrink-0 text-forest" />
            <h3 class="text-[17px] font-medium text-forest">
              Estou ciente de que
            </h3>
          </div>
          <ul class="flex flex-col gap-3">
            <li
              v-for="item in awareness"
              :key="item"
              class="flex gap-3 text-[14px] leading-[1.6] text-text-soft"
            >
              <span class="mt-2 size-1.5 shrink-0 rounded-full bg-forest" />
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>

        <div
          class="flex gap-4 rounded-[18px] border border-brand bg-cream-soft px-5 py-5 sm:px-6"
        >
          <div
            class="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-white"
          >
            <Gavel class="size-5.5 text-forest" />
          </div>
          <p class="pt-1 text-[14px] leading-[1.65] text-forest">
            Maus-tratos é crime e estarei sujeito às penas previstas pela
            <strong class="font-semibold"
              >Lei Federal de Proteção aos Animais</strong
            >
            nº 9605, art. 32, de 13 de fevereiro de 1998, no caso de infração.
          </p>
        </div>
      </div>
    </div>

    <footer
      v-if="!props.viewOnly"
      class="flex flex-col gap-4 border-t border-brand px-6 py-5 sm:px-8"
    >
      <div class="flex items-start gap-2.5">
        <Checkbox
          id="accept-adoption-terms"
          class="mt-0.5 cursor-pointer"
          :model-value="agreed"
          @update:model-value="(checked) => (agreed = checked === true)"
        />
        <Label
          for="accept-adoption-terms"
          class="text-[13px] leading-snug text-text-soft cursor-pointer"
        >
          Li e aceito os termos de adoção responsável e autorizo o contato da
          equipe.
        </Label>
      </div>
      <Button
        class="h-11 rounded-xl bg-forest px-6 text-[14px] font-semibold text-white hover:bg-forest/90"
        :disabled="!agreed"
        @click="close(true)"
      >
        Concordar e enviar candidatura
      </Button>
    </footer>
  </div>
</template>
