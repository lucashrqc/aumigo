<script setup lang="ts">
import { computed } from 'vue'
import { ClipboardList, X } from '@lucide/vue'
import useDialog from '@/composables/useDialog'
import { formatDocument } from '#shared/utils/document'
import type { AdoptionApplicationDto } from '#shared/types'

const props = defineProps<{ application: AdoptionApplicationDto }>()

const { close } = useDialog()

const app = computed(() => props.application)

const addressLine = computed(() => {
  const a = app.value
  const parts = [
    [a.street, a.number].filter(Boolean).join(', '),
    a.complement,
    a.neighborhood,
    a.city ? `${a.city.name}${a.city.state ? ` - ${a.city.state.uf}` : ''}` : '',
    a.zipCode ? `CEP ${a.zipCode}` : '',
  ].filter(Boolean)
  return parts.join(' · ') || '—'
})

const enclosureLabels = computed(() =>
  (app.value.enclosureType ?? []).map((v) => enclosureTypeLabel(v)),
)
</script>

<template>
  <div class="flex flex-col gap-5 p-4 text-forest sm:p-6">
    <div class="flex items-start justify-between gap-4">
      <div class="flex flex-col gap-1">
        <DialogTitle
          class="text-[22px] font-semibold tracking-[-0.5px] text-forest"
        >
          Candidatura de {{ app.adopter?.name ?? 'adotante' }}
        </DialogTitle>
        <DialogDescription class="text-[14px] text-text-soft">
          {{ app.pet?.name ?? 'Pet' }} ·
          {{ applicationStatusLabel(app.status) }} ·
          enviada em {{ formatDateTime(app.createdAt) }}
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

    <fieldset class="rounded-2xl border border-brand/50 bg-[#fffcf7] p-4">
      <legend class="px-2 text-[13px] font-semibold text-forest">
        Adotante
      </legend>
      <dl class="grid gap-3 sm:grid-cols-2">
        <div class="flex flex-col gap-0.5">
          <dt class="text-[12px] text-text-soft">Nome</dt>
          <dd class="text-[14px] font-medium">{{ app.adopter?.name ?? '—' }}</dd>
        </div>
        <div class="flex flex-col gap-0.5">
          <dt class="text-[12px] text-text-soft">E-mail</dt>
          <dd class="text-[14px] font-medium">{{ app.adopter?.email ?? '—' }}</dd>
        </div>
        <div class="flex flex-col gap-0.5">
          <dt class="text-[12px] text-text-soft">CPF/CNPJ</dt>
          <dd class="text-[14px] font-medium">{{ formatDocument(app.document) }}</dd>
        </div>
        <div class="flex flex-col gap-0.5">
          <dt class="text-[12px] text-text-soft">Telefone</dt>
          <dd class="text-[14px] font-medium">{{ app.contactPhone ?? '—' }}</dd>
        </div>
        <div class="flex flex-col gap-0.5">
          <dt class="text-[12px] text-text-soft">Idade</dt>
          <dd class="text-[14px] font-medium">{{ app.age }} anos</dd>
        </div>
      </dl>
    </fieldset>

    <fieldset class="rounded-2xl border border-brand/50 bg-[#fffcf7] p-4">
      <legend class="px-2 text-[13px] font-semibold text-forest">
        Moradia
      </legend>
      <dl class="grid gap-3 sm:grid-cols-2">
        <div class="flex flex-col gap-0.5">
          <dt class="text-[12px] text-text-soft">Tipo</dt>
          <dd class="text-[14px] font-medium">{{ homeLabel(app.home) }}</dd>
        </div>
        <div class="flex flex-col gap-0.5">
          <dt class="text-[12px] text-text-soft">Imóvel alugado?</dt>
          <dd class="text-[14px] font-medium">{{ yesNoLabel(app.isRental) }}</dd>
        </div>
        <div v-if="app.isRental" class="flex flex-col gap-0.5">
          <dt class="text-[12px] text-text-soft">Contrato permite animais?</dt>
          <dd class="text-[14px] font-medium">{{ yesNoLabel(app.allowPets) }}</dd>
        </div>
        <div class="flex flex-col gap-0.5 sm:col-span-2">
          <dt class="text-[12px] text-text-soft">Endereço</dt>
          <dd class="text-[14px] font-medium">{{ addressLine }}</dd>
        </div>
        <div class="flex flex-col gap-0.5 sm:col-span-2">
          <dt class="text-[12px] text-text-soft">Vedação do imóvel</dt>
          <dd class="flex flex-wrap gap-2">
            <span
              v-for="label in enclosureLabels"
              :key="label"
              class="rounded-full bg-cream-soft px-[9px] py-[5px] text-[12px] font-medium text-forest"
            >
              {{ label }}
            </span>
            <span v-if="!enclosureLabels.length" class="text-[14px] font-medium">
              —
            </span>
          </dd>
        </div>
      </dl>
    </fieldset>

    <fieldset class="rounded-2xl border border-brand/50 bg-[#fffcf7] p-4">
      <legend class="px-2 text-[13px] font-semibold text-forest">
        Declarações
      </legend>
      <dl class="grid gap-3 sm:grid-cols-2">
        <div class="flex flex-col gap-0.5">
          <dt class="text-[12px] text-text-soft">Primeiro pet?</dt>
          <dd class="text-[14px] font-medium">{{ yesNoLabel(app.firstPet) }}</dd>
        </div>
        <div class="flex flex-col gap-0.5">
          <dt class="text-[12px] text-text-soft">Condições financeiras?</dt>
          <dd class="text-[14px] font-medium">
            {{ yesNoLabel(app.hasFinancialConditions) }}
          </dd>
        </div>
        <div class="flex flex-col gap-0.5">
          <dt class="text-[12px] text-text-soft">Aceitou os termos?</dt>
          <dd class="text-[14px] font-medium">{{ yesNoLabel(app.acceptedTerms) }}</dd>
        </div>
      </dl>
    </fieldset>

    <fieldset
      v-if="app.message"
      class="rounded-2xl border border-brand/50 bg-[#fffcf7] p-4"
    >
      <legend class="px-2 text-[13px] font-semibold text-forest">
        Mensagem
      </legend>
      <p class="text-[14px] leading-[1.5] text-text-soft">{{ app.message }}</p>
    </fieldset>

    <div
      class="flex items-center justify-between gap-4 border-t border-brand/40 pt-4"
    >
      <span class="flex items-center gap-2 text-[13px] text-text-soft">
        <ClipboardList class="size-4" />
        {{ app.pet?.name ?? 'Pet' }} • Detalhes da candidatura
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
