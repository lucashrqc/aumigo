<script setup lang="ts">
import useDialog from '@/composables/useDialog'
import { useForm } from '@tanstack/vue-form'
import { Ban } from '@lucide/vue'
import { z } from 'zod'

const props = defineProps<{ application?: AdoptionApplicationDto }>()

const { close } = useDialog()

const form = useForm({
  defaultValues: { rejectReason: '' },
  onSubmit: ({ value }) => close(value.rejectReason.trim()),
})

const attempts = form.useStore((state) => state.submissionAttempts)
const showErrors = (touched: boolean) => touched || attempts.value > 0

const description = computed(() => {
  const adopter = props.application?.adopter?.name ?? 'o adotante'
  const pet = props.application?.pet
    ? petDisplayName(props.application.pet)
    : 'o pet'
  return `Rejeitar a candidatura de ${adopter} para ${pet}?`
})
</script>

<template>
  <form @submit.prevent="form.handleSubmit">
    <DialogHeader>
      <DialogTitle class="flex items-center gap-2">
        <Ban class="size-5" />
        Rejeitar candidatura
      </DialogTitle>
      <DialogDescription>{{ description }}</DialogDescription>
    </DialogHeader>

    <div class="py-4">
      <form.Field
        name="rejectReason"
        :validators="{
          onChange: z
            .string()
            .trim()
            .min(1, 'Informe o motivo da recusa')
            .max(1000, 'Máximo de 1000 caracteres'),
        }"
      >
        <template #default="{ field }">
          <FormField
            label="Motivo da recusa"
            required
            hint="Este motivo será visível para o adotante."
            :name="field.name"
            :errors="field.state.meta.errors"
            :touched="showErrors(field.state.meta.isTouched)"
          >
            <template #default="{ id }">
              <Textarea
                :id="id"
                :model-value="field.state.value"
                rows="4"
                @update:model-value="field.handleChange(String($event))"
                @blur="field.handleBlur"
              />
            </template>
          </FormField>
        </template>
      </form.Field>
    </div>

    <DialogFooter>
      <Button type="button" variant="outline" @click="close()">Cancelar</Button>
      <form.Subscribe>
        <template #default="{ canSubmit, isSubmitting }">
          <Button
            type="submit"
            variant="destructive"
            :disabled="!canSubmit || isSubmitting"
          >
            Rejeitar candidatura
          </Button>
        </template>
      </form.Subscribe>
    </DialogFooter>
  </form>
</template>
