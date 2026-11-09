<script setup lang="ts">
import { adoptionApplicationCreateSchema } from '#shared/schemas'
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
          petName ? `Candidatar-se para adotar ${petName}` : 'Candidatar-se para adotar'
        }}
      </DialogTitle>
      <DialogDescription class="text-[14px] leading-[1.5] text-text-soft">
        Informe um telefone de contato e uma breve mensagem. Nossa equipe
        analisa cada candidatura.
      </DialogDescription>
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
