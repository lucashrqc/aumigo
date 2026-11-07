<script setup lang="ts">
import { speciesCreateSchema, type SpeciesCreateInput } from '#shared/schemas'
import { useForm } from '@tanstack/vue-form'
import { toast } from 'vue-sonner'
import { z } from 'zod'

const props = defineProps<{ initial?: SpeciesDto | null; submitting?: boolean }>()
const emit = defineEmits<{ (e: 'submit', payload: SpeciesCreateInput): void }>()

const form = useForm({
  defaultValues: {
    name: props.initial?.name ?? '',
  },
  onSubmit: ({ value }) => {
    // Shared schema stays the source of truth: build the API payload and let
    // speciesCreateSchema validate/normalize it before emitting.
    const parsed = speciesCreateSchema.safeParse({
      name: value.name,
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
    <div class="grid gap-4">
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
    </div>

    <div class="flex justify-end">
      <form.Subscribe>
        <template #default="{ canSubmit, isSubmitting }">
          <Button type="submit" :disabled="submitting || isSubmitting || !canSubmit"
            >Salvar espécie</Button
          >
        </template>
      </form.Subscribe>
    </div>
  </form>
</template>
