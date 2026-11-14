<script setup lang="ts">
import type { AdoptionApplicationDto } from '#shared/types'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import PetGalleryDialog from '@/components/PetGalleryDialog.vue'
import { useCancelMyApplication } from '@/composables/useApplications'
import useDialog from '@/composables/useDialog'
import { resolveErrorMessage } from '@/utils/errors'
import { formatDate, petAgeLabel } from '@/utils/format'
import {
  applicationStatusLabel,
  petDisplayName,
  petSizeLabel,
} from '@/utils/labels'
import { Ban, Check, ImageIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'

defineProps<{ application: AdoptionApplicationDto }>()

const dialog = useDialog()

const { mutateAsync: cancelApplication, isPending: isCanceling } =
  useCancelMyApplication()

const placeholder = '/images/aumigo/pet-placeholder.jpeg'

const statusVariant = (s: string) =>
  s === 'approved' ? 'success' : s === 'rejected' ? 'destructive' : 'warning'

const coverUrl = (app: AdoptionApplicationDto) =>
  app.pet?.images?.[0]?.url ?? placeholder

const metaLine = (app: AdoptionApplicationDto) =>
  [
    petAgeLabel(app.pet?.birthDate),
    app.pet?.size ? `Porte ${petSizeLabel(app.pet.size)}` : null,
  ]
    .filter(Boolean)
    .join(' · ')

function openGallery(app: AdoptionApplicationDto) {
  if (!app.pet) return
  dialog.open(PetGalleryDialog, {
    dialogProps: {
      class:
        'max-w-[calc(100%-2rem)] p-0 bg-white text-forest border-brand sm:max-w-2xl',
      showCloseButton: false,
    },
    props: { pet: app.pet },
  })
}

async function handleCancel(app: AdoptionApplicationDto) {
  const ok = await dialog.open<boolean>(ConfirmDialog, {
    dialogProps: { class: 'max-w-md' },
    props: {
      title: 'Cancelar candidatura',
      icon: Ban,
      description: `Tem certeza que deseja cancelar sua candidatura para ${app.pet ? petDisplayName(app.pet) : 'este pet'}? Esta ação não pode ser desfeita.`,
      confirmText: 'Cancelar candidatura',
      cancelText: 'Voltar',
      destructive: true,
    },
  })
  if (!ok) return
  try {
    await cancelApplication(app.id)
    toast.success('Candidatura cancelada')
  } catch (err) {
    toast.error(
      resolveErrorMessage(err, 'Não foi possível cancelar a candidatura'),
    )
  }
}
</script>

<template>
  <article class="rounded-[20px] border border-brand/40 bg-white p-6">
    <div class="flex flex-col gap-6 sm:flex-row">
      <div class="flex w-full shrink-0 flex-col gap-3 sm:w-48">
        <img
          :src="coverUrl(application)"
          :alt="petDisplayName(application.pet)"
          class="aspect-square w-full rounded-[16px] object-cover"
        >
        <Button
          variant="outline"
          class="w-full border-brand text-forest hover:bg-cream-soft"
          :disabled="!application.pet?.images?.length"
          @click="openGallery(application)"
        >
          <ImageIcon class="size-4" />
          Ver fotos
        </Button>
      </div>

      <div class="flex min-w-0 flex-1 flex-col gap-3">
        <div class="flex items-start justify-between gap-4">
          <div class="flex flex-col gap-1">
            <NuxtLink
              :to="`/pets/${application.petId}`"
              class="text-[24px] font-semibold tracking-[-0.5px] text-forest hover:underline"
            >
              {{ petDisplayName(application.pet) }}
            </NuxtLink>
            <p v-if="metaLine(application)" class="text-[14px] text-text-soft">
              {{ metaLine(application) }}
            </p>
          </div>
          <div class="flex shrink-0 items-center gap-2">
            <Button
              v-if="application.status === 'pending'"
              variant="destructive"
              size="sm"
              class="cursor-pointer"
              :disabled="isCanceling"
              @click="handleCancel(application)"
            >
              <Ban class="size-4" />
              Cancelar
            </Button>
            <Badge
              :variant="statusVariant(application.status)"
              :class="[
                'shrink-0 gap-1.5 px-3.5 py-1.5 text-[13px] font-medium [&>svg]:size-4',
                application.status === 'rejected'
                  ? 'border-transparent bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                  : '',
              ]"
            >
              <Check v-if="application.status === 'approved'" />
              {{ applicationStatusLabel(application.status) }}
            </Badge>
          </div>
        </div>

        <p
          v-if="application.pet?.description"
          class="text-[15px] text-text-soft"
        >
          {{ application.pet.description }}
        </p>

        <p class="text-[13px] text-text-soft">
          Enviada em {{ formatDate(application.createdAt) }}
        </p>

        <div
          v-if="application.pet?.vaccines?.length"
          class="flex flex-col gap-2"
        >
          <span
            class="text-[11px] font-semibold uppercase tracking-[1px] text-forest/60"
          >
            Vacinas recebidas
          </span>
          <div class="flex flex-wrap gap-2">
            <Badge
              v-for="vaccine in application.pet.vaccines"
              :key="vaccine.id"
              class="border-none bg-cream-soft text-forest"
            >
              {{ vaccine.name }}
            </Badge>
          </div>
        </div>

        <div
          v-if="application.message"
          class="rounded-[14px] bg-cream-soft/60 px-4 py-3"
        >
          <span
            class="text-[11px] font-semibold uppercase tracking-[1px] text-forest/60"
          >
            Sua mensagem
          </span>
          <p class="mt-1 text-[14px] text-text-soft">
            {{ application.message }}
          </p>
        </div>

        <div
          v-if="application.status === 'rejected' && application.rejectReason"
          class="rounded-[14px] bg-red-50 px-4 py-3"
        >
          <span
            class="text-[11px] font-semibold uppercase tracking-[1px] text-red-600/70"
          >
            Motivo da recusa
          </span>
          <p class="mt-1 text-[14px] text-red-700/90">
            {{ application.rejectReason }}
          </p>
        </div>

        <p class="mt-1 text-[12px] text-text-soft/80">
          Confirme os dados e as vacinas com o responsável.
        </p>
      </div>
    </div>
  </article>
</template>
