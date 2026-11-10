<script setup lang="ts">
import { ref } from 'vue'
import { ScrollText, X } from '@lucide/vue'
import useDialog from '@/composables/useDialog'

const { close } = useDialog()
const agreed = ref(false)

const paragraphs = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet.',
  'Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.',
  'Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem.',
  'Proin ut ligula vel nunc egestas porttitor. Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis quis ligula lacinia aliquet. Mauris ipsum.',
  'Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in, nibh. Quisque volutpat condimentum velit. Class aptent taciti sociosqu ad litora torquent per conubia nostra.',
]
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
          Antes de enviar sua candidatura
        </DialogTitle>
        <DialogDescription class="text-[14px] leading-[1.5] text-text-soft">
          Leia os termos abaixo e confirme sua concordância para concluir o
          envio.
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
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-3">
          <ScrollText class="size-5 shrink-0 text-forest" />
          <h3 class="text-[17px] font-medium text-forest">
            Compromisso de cuidado
          </h3>
        </div>
        <p
          v-for="(paragraph, index) in paragraphs"
          :key="index"
          class="text-[15px] leading-[1.65] text-text-soft"
        >
          {{ paragraph }}
        </p>
      </div>
    </div>

    <footer
      class="flex flex-col gap-4 border-t border-brand px-6 py-5 sm:px-8"
    >
      <div class="flex items-start gap-2.5">
        <Checkbox
          id="accept-adoption-terms"
          class="mt-0.5"
          :model-value="agreed"
          @update:model-value="(checked) => (agreed = checked === true)"
        />
        <Label
          for="accept-adoption-terms"
          class="text-[13px] leading-snug text-text-soft"
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
