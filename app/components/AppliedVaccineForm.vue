<script setup lang="ts">
import {
  appliedVaccineFieldsSchema,
  type AppliedVaccineFieldsInput,
} from '#shared/schemas'
import { useForm } from '@tanstack/vue-form'
import { toast } from 'vue-sonner'
import { z } from 'zod'

const props = withDefaults(
  defineProps<{
    initial?: AppliedVaccineDto | null
    submitting?: boolean
    submitLabel?: string
  }>(),
  { initial: null, submitting: false, submitLabel: 'Registrar vacina' },
)
const emit = defineEmits<{
  (e: 'submit', payload: AppliedVaccineFieldsInput): void
}>()

const vaccineOptions = useVaccineOptions()

const form = useForm({
  defaultValues: {
    vaccineId: props.initial?.vaccineId ?? '',
    applicationDate: props.initial?.applicationDate ?? '',
    nextDoseDate: props.initial?.nextDoseDate ?? '',
    vetLicense: props.initial?.vetLicense ?? '',
    batchNumber: props.initial?.batchNumber ?? '',
  },
  onSubmit: ({ value }) => {
    const parsed = appliedVaccineFieldsSchema.safeParse({
      vaccineId: value.vaccineId,
      applicationDate: value.applicationDate,
      nextDoseDate: value.nextDoseDate || null,
      vetLicense: value.vetLicense || null,
      batchNumber: value.batchNumber || null,
    })

    if (!parsed.success) {
      toast.error('Verifique os campos do formulário')
      return
    }
    emit('submit', parsed.data)
  },
})

const attempts = form.useStore((state) => state.submissionAttempts)
const showErrors = (touched: boolean) => touched || attempts.value > 0
</script>

<template>
  <form class="space-y-4" @submit.prevent="form.handleSubmit">
    <div class="grid gap-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
      <form.Field
        name="vaccineId"
        :validators="{ onChange: z.string().min(1, 'Selecione a vacina') }"
      >
        <template #default="{ field }">
          <FormField
            label="Vacina"
            required
            :name="field.name"
            :errors="field.state.meta.errors"
            :touched="showErrors(field.state.meta.isTouched)"
          >
            <AsyncCombobox
              :model-value="field.state.value"
              :items="vaccineOptions.items"
              :is-fetching="vaccineOptions.isFetching"
              :is-fetching-next-page="vaccineOptions.isFetchingNextPage"
              :has-next-page="vaccineOptions.hasNextPage"
              :resolve-by-id="vaccineOptions.resolveById"
              option-value="id"
              option-label="name"
              placeholder="Selecione a vacina"
              search-placeholder="Buscar vacina…"
              @update:model-value="field.handleChange(String($event ?? ''))"
              @search="vaccineOptions.setSearch"
              @can-load-more="vaccineOptions.loadMore"
            />
          </FormField>
        </template>
      </form.Field>

      <form.Field
        name="applicationDate"
        :validators="{
          onChange: z.string().min(1, 'Informe a data de aplicação'),
        }"
      >
        <template #default="{ field }">
          <FormField
            label="Data de aplicação"
            required
            :name="field.name"
            :errors="field.state.meta.errors"
            :touched="showErrors(field.state.meta.isTouched)"
          >
            <template #default="{ id: fieldId }">
              <DatePickerInput
                :id="fieldId"
                :model-value="field.state.value"
                @update:model-value="field.handleChange($event ?? '')"
                @error="
                  field.setErrorMap({ onChange: ($event ?? undefined) as any })
                "
                @blur="field.handleBlur"
              />
            </template>
          </FormField>
        </template>
      </form.Field>

      <form.Field name="nextDoseDate">
        <template #default="{ field }">
          <FormField
            label="Próxima dose"
            :name="field.name"
            :errors="field.state.meta.errors"
            :touched="showErrors(field.state.meta.isTouched)"
          >
            <template #default="{ id: fieldId }">
              <DatePickerInput
                :id="fieldId"
                :model-value="field.state.value"
                @update:model-value="field.handleChange($event ?? '')"
                @error="
                  field.setErrorMap({ onChange: ($event ?? undefined) as any })
                "
                @blur="field.handleBlur"
              />
            </template>
          </FormField>
        </template>
      </form.Field>

      <form.Field name="vetLicense">
        <template #default="{ field }">
          <FormField label="CRMV do veterinário" :name="field.name">
            <template #default="{ id: fieldId }">
              <Input
                :id="fieldId"
                :model-value="field.state.value"
                @update:model-value="field.handleChange(String($event))"
                @blur="field.handleBlur"
              />
            </template>
          </FormField>
        </template>
      </form.Field>

      <form.Field name="batchNumber">
        <template #default="{ field }">
          <FormField label="Número do lote" :name="field.name">
            <template #default="{ id: fieldId }">
              <Input
                :id="fieldId"
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
          <Button type="submit" :disabled="submitting || isSubmitting || !canSubmit">
            {{ submitLabel }}
          </Button>
        </template>
      </form.Subscribe>
    </div>
  </form>
</template>
