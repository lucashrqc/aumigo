<script setup lang="ts">
import { adoptionApplicationCreateSchema } from '#shared/schemas'
import { PawPrint } from '@lucide/vue'
import { useForm } from '@tanstack/vue-form'
import { toast } from 'vue-sonner'
import { z } from 'zod'
import useDialog from '@/composables/useDialog'

const props = defineProps<{
  petId?: string
  petName?: string
  demo?: boolean
}>()

const { close } = useDialog()
const { mutateAsync: apply, isPending } = useApplyForPet()

const { data: pet, isLoading: isPetLoading } = usePublicPetQuery(
  () => props.petId,
  { enabled: computed(() => Boolean(props.petId) && !props.demo) },
)

const petPhoto = computed(() => pet.value?.images?.[0]?.url ?? null)
const petVaccines = computed(() => pet.value?.vaccines ?? [])
const petMeta = computed(() => {
  const p = pet.value
  if (!p) return ''
  const parts: string[] = []
  const age = petAgeLabel(p.birthDate)
  if (age) parts.push(age)
  if (p.size) parts.push(`Porte ${petSizeLabel(p.size).toLowerCase()}`)
  return parts.join(' · ')
})

const form = useForm({
  defaultValues: {
    contactPhone: '',
    message: '',
  },
  onSubmit: async ({ value }) => {
    // Landing cards are illustrative and carry no real pet id yet: the real
    // submission is wired in a later branch, so here we just acknowledge.
    if (props.demo || !props.petId) {
      toast.info('Em breve você poderá se candidatar à adoção por aqui.')
      close()
      return
    }

    const parsed = adoptionApplicationCreateSchema.safeParse({
      petId: props.petId,
      contactPhone: value.contactPhone,
      message: value.message || undefined,
    })
    if (!parsed.success) {
      toast.error('Verifique os campos do formulário')
      return
    }

    try {
      await apply(parsed.data)
      toast.success('Candidatura enviada! Nossa equipe entrará em contato.')
      close(true)
      await navigateTo('/applications')
    } catch (err) {
      toast.error(
        resolveErrorMessage(err, 'Não foi possível enviar a candidatura'),
      )
    }
  },
})

const attempts = form.useStore((state) => state.submissionAttempts)
const showErrors = (touched: boolean) => touched || attempts.value > 0
</script>

<template>
  <form
    class="flex flex-col gap-5 text-forest"
    @submit.prevent="form.handleSubmit"
  >
    <div class="flex flex-col gap-1.5">
      <DialogTitle
        class="text-[22px] font-semibold tracking-[-0.5px] text-forest"
      >
        {{
          petName
            ? `Candidatar-se para adotar ${petName}`
            : 'Candidatar-se para adotar'
        }}
      </DialogTitle>
      <DialogDescription class="text-[14px] leading-[1.5] text-text-soft">
        Informe um telefone de contato e uma breve mensagem. Nossa equipe
        analisa cada candidatura.
      </DialogDescription>
    </div>

    <div
      v-if="isPetLoading"
      class="h-45 w-full animate-pulse rounded-xl border border-brand bg-[#fffcf7]"
    />
    <div
      v-else-if="pet"
      class="flex flex-col gap-3 rounded-xl border border-brand bg-[#fffcf7] p-4"
    >
      <div class="flex items-center gap-4">
        <div
          class="h-33 w-33 shrink-0 overflow-hidden rounded-lg bg-cream-soft"
        >
          <img
            v-if="petPhoto"
            :src="petPhoto"
            :alt="pet.name"
            class="h-full w-full object-cover backface-hidden"
          >
          <div
            v-else
            class="flex h-full w-full items-center justify-center text-forest/40"
          >
            <PawPrint class="size-10" />
          </div>
        </div>
        <div class="flex min-w-0 flex-1 flex-col gap-2">
          <p
            class="text-[24px] font-medium tracking-[-0.7px] text-forest leading-none"
          >
            {{ pet.name }}
          </p>
          <p v-if="petMeta" class="text-[12px] text-text-soft">
            {{ petMeta }}
          </p>
          <p
            v-if="pet.description"
            class="line-clamp-3 text-[13px] leading-[1.5] text-text-soft"
          >
            {{ pet.description }}
          </p>
        </div>
      </div>

      <div v-if="petVaccines.length" class="flex flex-wrap items-center gap-2">
        <span class="text-[12px] font-medium text-forest">Vacinas</span>
        <span
          v-for="vaccine in petVaccines"
          :key="vaccine.id"
          class="rounded-full bg-cream-soft px-[9px] py-[5px] text-[12px] font-medium text-forest"
        >
          {{ vaccine.name }}
        </span>
      </div>

      <p class="text-[11px] leading-[1.4] text-text-soft">
        Confirme os dados e as vacinas com a equipe responsável.
      </p>
    </div>

    <form.Field
      name="contactPhone"
      :validators="{
        onChange: z.string().trim().min(5, 'Informe um telefone de contato'),
      }"
    >
      <template #default="{ field }">
        <FormField
          label="Telefone de contato"
          required
          :name="field.name"
          :errors="field.state.meta.errors"
          :touched="showErrors(field.state.meta.isTouched)"
        >
          <template #default="{ id }">
            <Input
              :id="id"
              :model-value="field.state.value"
              placeholder="+55 11 99999-9999"
              class="h-12 rounded-xl border-brand bg-white text-[14px] text-forest placeholder:text-forest/50"
              @update:model-value="field.handleChange(String($event))"
              @blur="field.handleBlur"
            />
          </template>
        </FormField>
      </template>
    </form.Field>

    <form.Field
      name="message"
      :validators="{ onChange: z.string().max(1000, 'Mensagem muito longa') }"
    >
      <template #default="{ field }">
        <FormField
          label="Mensagem (opcional)"
          :name="field.name"
          :errors="field.state.meta.errors"
          :touched="showErrors(field.state.meta.isTouched)"
        >
          <template #default="{ id }">
            <Textarea
              :id="id"
              :model-value="field.state.value"
              placeholder="Conte-nos sobre o seu lar…"
              class="min-h-24 rounded-xl border-brand bg-white text-[14px] text-forest placeholder:text-forest/50"
              @update:model-value="field.handleChange(String($event))"
              @blur="field.handleBlur"
            />
          </template>
        </FormField>
      </template>
    </form.Field>

    <div class="flex justify-end gap-3">
      <Button
        type="button"
        variant="outline"
        class="h-11 rounded-xl border-brand bg-white text-[14px] font-semibold text-forest hover:bg-cream-soft hover:text-forest"
        @click="close()"
      >
        Cancelar
      </Button>
      <form.Subscribe>
        <template #default="{ canSubmit, isSubmitting }">
          <Button
            type="submit"
            :disabled="isPending || isSubmitting || !canSubmit"
            class="h-11 rounded-xl bg-forest text-[14px] font-semibold text-white hover:bg-forest/90"
          >
            Enviar candidatura
          </Button>
        </template>
      </form.Subscribe>
    </div>
  </form>
</template>
