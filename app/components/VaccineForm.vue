<script setup lang="ts">
import { vaccineCreateSchema, type VaccineCreateInput } from '#shared/schemas'
import { useForm } from '@tanstack/vue-form'
import { toast } from 'vue-sonner'
import { z } from 'zod'

const props = defineProps<{ initial?: VaccineDto | null; submitting?: boolean }>()
const emit = defineEmits<{ (e: 'submit', payload: VaccineCreateInput): void }>()

const form = useForm({
  defaultValues: {
    name: props.initial?.name ?? '',
    description: props.initial?.description ?? '',
    expirationDate: props.initial?.expirationDate ?? '',
  },
  onSubmit: ({ value }) => {
    // Shared schema stays the source of truth: build the API payload and let
    // vaccineCreateSchema validate/normalize it before emitting.
    const parsed = vaccineCreateSchema.safeParse({
      name: value.name,
      description: value.description || null,
      expirationDate: value.expirationDate || null,
    })

    if (!parsed.success) {
      toast.error('Verifique os campos do formulário')
      return
    }
    emit('submit', parsed.data)
  },
})

const attempts = form.useStore((state) => state.submissionAttempts)

// Show a field's error once it was touched or a submit was attempted.
const showErrors = (touched: boolean) => touched || attempts.value > 0
</script>

<template>
  <form class="space-y-4" @submit.prevent="form.handleSubmit">
    <div class="grid gap-4 sm:grid-cols-2">
      <form.Field
        name="name"
        :validators="{ onChange: z.string().trim().min(1, 'Informe o nome') }"
      >
        <template #default="{ field }">
          <FormField
            label="Nome"
            required
            :name="field.name"
            :errors="field.state.meta.errors"
            :touched="showErrors(field.state.meta.isTouched)"
          >
            <template #default="{ id }">
              <Input
                :id="id"
                :model-value="field.state.value"
                @update:model-value="field.handleChange(String($event))"
                @blur="field.handleBlur"
              />
            </template>
          </FormField>
        </template>
      </form.Field>

      <form.Field name="expirationDate">
        <template #default="{ field }">
          <FormField
            label="Data de validade"
            :name="field.name"
            :errors="field.state.meta.errors"
            :touched="showErrors(field.state.meta.isTouched)"
          >
            <template #default="{ id }">
              <DatePickerInput
                :id="id"
                :model-value="field.state.value"
                @update:model-value="field.handleChange($event ?? '')"
                @error="field.setErrorMap({ onChange: ($event ?? undefined) as any })"
                @blur="field.handleBlur"
              />
            </template>
          </FormField>
        </template>
      </form.Field>
    </div>

    <form.Field name="description">
      <template #default="{ field }">
        <FormField label="Descrição" :name="field.name">
          <template #default="{ id }">
            <Textarea
              :id="id"
              :model-value="field.state.value"
              @update:model-value="field.handleChange(String($event))"
              @blur="field.handleBlur"
            />
          </template>
        </FormField>
      </template>
    </form.Field>

    <div class="flex justify-end">
      <form.Subscribe>
        <template #default="{ canSubmit, isSubmitting }">
          <Button type="submit" :disabled="submitting || isSubmitting || !canSubmit"
            >Salvar vacina</Button
          >
        </template>
      </form.Subscribe>
    </div>
  </form>
</template>
