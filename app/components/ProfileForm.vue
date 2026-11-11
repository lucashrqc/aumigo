<script setup lang="ts">
import { profileUpdateSchema, type ProfileUpdateInput } from '#shared/schemas'
import type { ProfileDto } from '#shared/types'
import { Skeleton } from '@/components/ui/skeleton'
import { useForm } from '@tanstack/vue-form'
import { toast } from 'vue-sonner'
import { z } from 'zod'

const props = defineProps<{
  initial?: ProfileDto | null
  email?: string
  submitting?: boolean
  isLoading?: boolean
}>()
const emit = defineEmits<{ (e: 'submit', payload: ProfileUpdateInput): void }>()

const form = useForm({
  defaultValues: {
    name: props.initial?.name ?? '',
    phone: props.initial?.phone ?? '',
  },
  onSubmit: ({ value }) => {
    const parsed = profileUpdateSchema.safeParse({
      name: value.name,
      phone: value.phone || null,
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
  <div v-if="isLoading">
    <div class="divide-y border-t">
      <div
        v-for="n in 3"
        :key="n"
        class="grid gap-x-8 gap-y-2 py-5 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] sm:items-center"
      >
        <div class="space-y-1">
          <Skeleton class="h-4 w-24" />
          <Skeleton v-if="n === 2" class="h-3 w-full" />
          <Skeleton v-if="n === 2" class="h-3 w-3/5" />
        </div>
        <div class="sm:max-w-md">
          <Skeleton class="h-9 w-full" />
        </div>
      </div>
    </div>
    <div class="flex justify-end pt-6">
      <Skeleton class="h-9 w-40" />
    </div>
  </div>

  <form v-else @submit.prevent="form.handleSubmit">
    <div class="divide-y border-t">
      <form.Field
        name="name"
        :validators="{ onChange: z.string().trim().min(1, 'Informe o nome') }"
      >
        <template #default="{ field }">
          <FormField
            label="Nome"
            required
            orientation="horizontal"
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

      <FormField
        label="Email"
        name="email"
        orientation="horizontal"
        hint="Para alterar o email, entre em contato com um administrador."
      >
        <template #default="{ id }">
          <Input :id="id" :model-value="email ?? ''" disabled readonly />
        </template>
      </FormField>

      <form.Field
        name="phone"
        :validators="{
          onChange: z.string().trim().max(30, 'Telefone muito longo'),
        }"
      >
        <template #default="{ field }">
          <FormField
            label="Telefone"
            orientation="horizontal"
            :name="field.name"
            :errors="field.state.meta.errors"
            :touched="showErrors(field.state.meta.isTouched)"
          >
            <template #default="{ id }">
              <PhoneInput
                :id="id"
                placeholder="(11) 99999-9999"
                :model-value="field.state.value"
                @update:model-value="field.handleChange($event)"
                @blur="field.handleBlur"
              />
            </template>
          </FormField>
        </template>
      </form.Field>
    </div>

    <div class="flex justify-end pt-6">
      <form.Subscribe>
        <template #default="{ canSubmit, isSubmitting }">
          <Button
            type="submit"
            :disabled="submitting || isSubmitting || !canSubmit"
          >
            Salvar alterações
          </Button>
        </template>
      </form.Subscribe>
    </div>
  </form>
</template>
