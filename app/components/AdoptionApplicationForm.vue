<script setup lang="ts">
import {
  adoptionApplicationCreateSchema,
  enclosureTypeValues,
  homeValues,
} from '#shared/schemas'
import { isValidDocument } from '#shared/utils/document'
import AdoptionTermsDialog from '@/components/AdoptionTermsDialog.vue'
import PetGalleryDialog from '@/components/PetGalleryDialog.vue'
import useDialog from '@/composables/useDialog'
import { ImageIcon, PawPrint } from '@lucide/vue'
import { useForm } from '@tanstack/vue-form'
import { watch } from 'vue'
import { toast } from 'vue-sonner'
import { z } from 'zod'

const props = defineProps<{
  petId?: string
  petName?: string
  variant?: 'dialog' | 'page'
}>()

const isPage = computed(() => props.variant === 'page')

const dialog = useDialog()

// Cancel/close: on a page there is no dialog to dismiss, so navigate back to
// the pet (or the listing) instead.
function dismiss() {
  if (isPage.value) {
    return navigateTo('/pets')
  }
  dialog.close()
}

const termsDialogProps = {
  class:
    'max-w-[calc(100%-2rem)] gap-0 overflow-hidden p-0 bg-white text-forest border-brand sm:max-w-2xl',
  showCloseButton: false,
}

const { mutateAsync: apply, isPending } = useApplyForPet()
const { data: pet, isLoading: isPetLoading } = usePublicPetQuery(
  () => props.petId,
  { enabled: computed(() => Boolean(props.petId)) },
)

const petDisplay = computed(() => petDisplayName(pet.value))
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

function openGallery() {
  if (!pet.value) return
  dialog.open(PetGalleryDialog, {
    dialogProps: {
      class:
        'max-w-[calc(100%-2rem)] p-0 bg-white text-forest border-brand sm:max-w-2xl',
      showCloseButton: false,
    },
    props: { pet: pet.value },
  })
}

const homeOptions = [
  { label: 'Casa', value: 'house' },
  { label: 'Apartamento', value: 'apartment' },
] as const

const enclosureOptions = enclosureTypeValues.map((value) => ({
  value,
  label: enclosureTypeLabel(value),
}))

const form = useForm({
  defaultValues: {
    document: '',
    contactPhone: '',
    message: '',
    age: undefined as number | undefined,
    home: undefined as (typeof homeValues)[number] | undefined,
    stateId: '',
    cityId: '',
    zipCode: '',
    street: '',
    number: '',
    neighborhood: '',
    complement: '',
    isRental: undefined as boolean | undefined,
    allowPets: undefined as boolean | undefined,
    firstPet: undefined as boolean | undefined,
    hasFinancialConditions: undefined as boolean | undefined,
    enclosureType: [] as (typeof enclosureTypeValues)[number][],
  },
  onSubmit: async ({ value }) => {
    if (!props.petId) {
      toast.info('Em breve você poderá se candidatar à adoção por aqui.')
      dismiss()
      return
    }

    const agreedToTerms = await dialog.open<boolean>(AdoptionTermsDialog, {
      dialogProps: termsDialogProps,
    })
    if (!agreedToTerms) return

    const parsed = adoptionApplicationCreateSchema.safeParse({
      petId: props.petId,
      document: value.document,
      contactPhone: value.contactPhone,
      message: value.message || undefined,
      age: value.age,
      home: value.home,
      cityId: value.cityId,
      street: value.street,
      number: value.number,
      neighborhood: value.neighborhood,
      complement: value.complement || undefined,
      zipCode: value.zipCode,
      isRental: value.isRental,
      allowPets: value.isRental ? value.allowPets : undefined,
      firstPet: value.firstPet,
      hasFinancialConditions: value.hasFinancialConditions,
      enclosureType: value.enclosureType.length
        ? value.enclosureType
        : undefined,
      acceptedTerms: true,
    })
    if (!parsed.success) {
      toast.error('Verifique os campos do formulário')
      return
    }

    try {
      await apply(parsed.data)
      toast.success('Candidatura enviada! Nossa equipe entrará em contato.')
      if (!isPage.value) dialog.close(true)
      await navigateTo('/applications')
    } catch (err) {
      toast.error(
        resolveErrorMessage(err, 'Não foi possível enviar a candidatura'),
      )
    }
  },
})

const attempts = form.useStore((state) => state.submissionAttempts)
const stateId = form.useStore((state) => state.values.stateId)
const zipCode = form.useStore((state) => state.values.zipCode)
const isRental = form.useStore((state) => state.values.isRental)
const showErrors = (touched: boolean) => touched || attempts.value > 0

const states = useStateOptions()
const cities = useCityOptions(() => stateId.value || undefined)

function onStateChange(value: string) {
  form.setFieldValue('stateId', value)
  form.setFieldValue('cityId', '')
}

const cep = useCep(() => zipCode.value)

watch(
  () => cep.data.value,
  (data) => {
    if (!data) return
    form.setFieldValue('street', data.street)
    form.setFieldValue('neighborhood', data.neighborhood)
    if (data.state) form.setFieldValue('stateId', data.state.id)
    form.setFieldValue('cityId', data.city?.id ?? '')
  },
)

watch(
  () => cep.isError.value,
  (hasError) => {
    if (hasError) toast.error('CEP não encontrado')
  },
)

const boolFieldValue = (v: boolean | undefined) =>
  v === undefined ? undefined : v ? '1' : '0'
</script>

<template>
  <form
    class="flex flex-col gap-8 text-forest"
    @submit.prevent="form.handleSubmit"
  >
    <div v-if="!isPage" class="flex flex-col gap-1.5">
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
        Preencha os dados abaixo. Nossa equipe analisa cada candidatura com
        cuidado.
      </DialogDescription>
    </div>

    <div
      v-if="isPetLoading"
      class="h-45 w-full animate-pulse rounded-xl border border-brand bg-[#fffcf7]"
    />
    <div
      v-else-if="pet"
      class="relative flex flex-col gap-3 rounded-xl border border-brand bg-[#fffcf7] p-4"
    >
      <button
        type="button"
        :aria-label="`Ver galeria de fotos de ${petDisplay}`"
        class="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-brand bg-white px-3 py-1.5 text-[12px] font-medium text-forest transition-colors hover:bg-cream-soft"
        @click="openGallery()"
      >
        <ImageIcon class="size-3.5" />
        Ver fotos
      </button>

      <div class="flex items-center gap-4">
        <button
          type="button"
          :aria-label="`Ver galeria de fotos de ${petDisplay}`"
          class="h-33 w-33 shrink-0 cursor-pointer overflow-hidden rounded-lg bg-cream-soft transition-opacity hover:opacity-90"
          @click="openGallery()"
        >
          <img
            v-if="petPhoto"
            :src="petPhoto"
            :alt="petDisplay"
            class="h-full w-full object-cover backface-hidden"
          >
          <div
            v-else
            class="flex h-full w-full items-center justify-center text-forest/40"
          >
            <PawPrint class="size-10" />
          </div>
        </button>
        <div class="flex min-w-0 flex-1 flex-col gap-2">
          <p
            class="text-[24px] font-medium tracking-[-0.7px] text-forest leading-none"
          >
            {{ petDisplay }}
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
      name="document"
      :validators="{
        onChange: z
          .string()
          .trim()
          .refine(
            (v) => v === '' || isValidDocument(v),
            'Informe um CPF ou CNPJ válido',
          ),
      }"
    >
      <template #default="{ field }">
        <FormField
          label="CPF ou CNPJ (opcional)"
          :name="field.name"
          :errors="field.state.meta.errors"
          :touched="showErrors(field.state.meta.isTouched)"
        >
          <template #default="{ id }">
            <DocumentInput
              :id="id"
              :model-value="field.state.value"
              placeholder="000.000.000-00"
              @update:model-value="field.handleChange($event ?? '')"
              @blur="field.handleBlur"
            />
          </template>
        </FormField>
      </template>
    </form.Field>

    <div class="grid gap-5 sm:grid-cols-2">
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
              <PhoneInput
                :id="id"
                :model-value="field.state.value"
                placeholder="(11) 99999-9999"
                @update:model-value="field.handleChange($event)"
                @blur="field.handleBlur"
              />
            </template>
          </FormField>
        </template>
      </form.Field>

      <form.Field
        name="age"
        :validators="{
          onChange: z
            .number({ error: 'Informe a idade' })
            .int()
            .min(18, 'Idade mínima 18 anos')
            .max(120, 'Idade inválida'),
        }"
      >
        <template #default="{ field }">
          <FormField
            label="Sua idade"
            required
            :name="field.name"
            :errors="field.state.meta.errors"
            :touched="showErrors(field.state.meta.isTouched)"
          >
            <template #default="{ id }">
              <Input
                :id="id"
                type="number"
                min="18"
                max="120"
                :model-value="field.state.value"
                placeholder="Ex.: 30"
                @update:model-value="
                  field.handleChange($event === '' ? undefined : Number($event))
                "
                @blur="field.handleBlur"
              />
            </template>
          </FormField>
        </template>
      </form.Field>
    </div>

    <form.Field
      name="home"
      :validators="{
        onChange: z.enum(homeValues, { error: 'Selecione o tipo de moradia' }),
      }"
    >
      <template #default="{ field }">
        <FormField
          label="Tipo de moradia"
          required
          :name="field.name"
          :errors="field.state.meta.errors"
          :touched="showErrors(field.state.meta.isTouched)"
        >
          <RadioGroup
            :model-value="field.state.value"
            class="flex flex-row gap-6 mt-4"
            @update:model-value="
              (ev) => field.handleChange(ev as typeof field.state.value)
            "
          >
            <div
              v-for="opt in homeOptions"
              :key="opt.value"
              class="flex items-center space-x-2"
            >
              <RadioGroupItem
                :id="`home-${opt.value}`"
                :value="opt.value"
                class="cursor-pointer"
              />
              <Label :for="`home-${opt.value}`" class="cursor-pointer">{{
                opt.label
              }}</Label>
            </div>
          </RadioGroup>
        </FormField>
      </template>
    </form.Field>

    <fieldset class="flex flex-col gap-4 rounded-xl border border-brand/60 p-4">
      <legend class="px-1 text-[13px] font-semibold text-forest">
        Endereço
      </legend>

      <div class="grid gap-5 sm:grid-cols-2">
        <form.Field
          name="zipCode"
          :validators="{ onChange: z.string().trim().min(1, 'Informe o CEP') }"
        >
          <template #default="{ field }">
            <FormField
              label="CEP"
              required
              :name="field.name"
              :errors="field.state.meta.errors"
              :touched="showErrors(field.state.meta.isTouched)"
            >
              <template #default="{ id }">
                <CepInput
                  :id="id"
                  :model-value="field.state.value"
                  @update:model-value="field.handleChange($event)"
                  @blur="field.handleBlur"
                />
              </template>
            </FormField>
          </template>
        </form.Field>

        <form.Field
          name="street"
          :validators="{ onChange: z.string().trim().min(1, 'Informe a rua') }"
        >
          <template #default="{ field }">
            <FormField
              label="Rua"
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

        <form.Field
          name="number"
          :validators="{
            onChange: z.string().trim().min(1, 'Informe o número'),
          }"
        >
          <template #default="{ field }">
            <FormField
              label="Número"
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

        <form.Field
          name="neighborhood"
          :validators="{
            onChange: z.string().trim().min(1, 'Informe o bairro'),
          }"
        >
          <template #default="{ field }">
            <FormField
              label="Bairro"
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

        <form.Field name="complement">
          <template #default="{ field }">
            <FormField label="Complemento (opcional)" :name="field.name">
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

        <form.Field
          name="stateId"
          :validators="{ onChange: z.string().min(1, 'Selecione o estado') }"
        >
          <template #default="{ field }">
            <FormField
              label="Estado"
              required
              :name="field.name"
              :errors="field.state.meta.errors"
              :touched="showErrors(field.state.meta.isTouched)"
            >
              <AsyncCombobox
                :model-value="field.state.value"
                :items="states.items"
                :is-fetching="states.isFetching"
                :is-fetching-next-page="states.isFetchingNextPage"
                :has-next-page="states.hasNextPage"
                :resolve-by-id="states.resolveById"
                option-value="id"
                option-label="name"
                placeholder="Selecione o estado"
                search-placeholder="Buscar estado…"
                @update:model-value="onStateChange(String($event ?? ''))"
                @search="states.setSearch"
                @can-load-more="states.loadMore"
              />
            </FormField>
          </template>
        </form.Field>

        <form.Field
          name="cityId"
          :validators="{ onChange: z.string().min(1, 'Selecione a cidade') }"
        >
          <template #default="{ field }">
            <FormField
              label="Cidade"
              required
              :name="field.name"
              :errors="field.state.meta.errors"
              :touched="showErrors(field.state.meta.isTouched)"
            >
              <AsyncCombobox
                :model-value="field.state.value"
                :items="cities.items"
                :is-fetching="cities.isFetching"
                :is-fetching-next-page="cities.isFetchingNextPage"
                :has-next-page="cities.hasNextPage"
                :resolve-by-id="cities.resolveById"
                :disabled="!stateId"
                option-value="id"
                option-label="name"
                placeholder="Selecione a cidade"
                search-placeholder="Buscar cidade…"
                @update:model-value="field.handleChange(String($event ?? ''))"
                @search="cities.setSearch"
                @can-load-more="cities.loadMore"
              />
            </FormField>
          </template>
        </form.Field>
      </div>
    </fieldset>

    <form.Field
      name="isRental"
      :validators="{
        onChange: z.boolean({ error: 'Selecione uma opção' }),
      }"
    >
      <template #default="{ field }">
        <FormField
          label="O imóvel é alugado?"
          required
          :name="field.name"
          :errors="field.state.meta.errors"
          :touched="showErrors(field.state.meta.isTouched)"
        >
          <RadioGroup
            :model-value="boolFieldValue(field.state.value)"
            class="flex flex-row gap-6 mt-4"
            @update:model-value="
              (ev) => field.handleChange(Boolean(Number(ev)))
            "
          >
            <div class="flex items-center space-x-2">
              <RadioGroupItem
                id="isRental-sim"
                value="1"
                class="cursor-pointer"
              />
              <Label for="isRental-sim" class="cursor-pointer">Sim</Label>
            </div>
            <div class="flex items-center space-x-2">
              <RadioGroupItem
                id="isRental-nao"
                value="0"
                class="cursor-pointer"
              />
              <Label for="isRental-nao" class="cursor-pointer">Não</Label>
            </div>
          </RadioGroup>
        </FormField>
      </template>
    </form.Field>

    <form.Field
      v-if="isRental === true"
      name="allowPets"
      :validators="{
        onChange: z.boolean({ error: 'Selecione uma opção' }),
      }"
    >
      <template #default="{ field }">
        <FormField
          label="O contrato de locação permite animais?"
          required
          :name="field.name"
          :errors="field.state.meta.errors"
          :touched="showErrors(field.state.meta.isTouched)"
        >
          <RadioGroup
            :model-value="boolFieldValue(field.state.value)"
            class="flex flex-row gap-6 mt-4"
            @update:model-value="
              (ev) => field.handleChange(Boolean(Number(ev)))
            "
          >
            <div class="flex items-center space-x-2">
              <RadioGroupItem
                id="allowPets-sim"
                value="1"
                class="cursor-pointer"
              />
              <Label for="allowPets-sim" class="cursor-pointer">Sim</Label>
            </div>
            <div class="flex items-center space-x-2">
              <RadioGroupItem
                id="allowPets-nao"
                value="0"
                class="cursor-pointer"
              />
              <Label for="allowPets-nao" class="cursor-pointer">Não</Label>
            </div>
          </RadioGroup>
        </FormField>
      </template>
    </form.Field>

    <form.Field
      name="firstPet"
      :validators="{
        onChange: z.boolean({ error: 'Selecione uma opção' }),
      }"
    >
      <template #default="{ field }">
        <FormField
          label="É o seu primeiro pet?"
          required
          :name="field.name"
          :errors="field.state.meta.errors"
          :touched="showErrors(field.state.meta.isTouched)"
        >
          <RadioGroup
            :model-value="boolFieldValue(field.state.value)"
            class="flex flex-row gap-6 mt-4"
            @update:model-value="
              (ev) => field.handleChange(Boolean(Number(ev)))
            "
          >
            <div class="flex items-center space-x-2">
              <RadioGroupItem
                id="firstPet-sim"
                value="1"
                class="cursor-pointer"
              />
              <Label for="firstPet-sim" class="cursor-pointer">Sim</Label>
            </div>
            <div class="flex items-center space-x-2">
              <RadioGroupItem
                id="firstPet-nao"
                value="0"
                class="cursor-pointer"
              />
              <Label for="firstPet-nao" class="cursor-pointer">Não</Label>
            </div>
          </RadioGroup>
        </FormField>
      </template>
    </form.Field>

    <form.Field
      name="hasFinancialConditions"
      :validators="{
        onChange: z.boolean({ error: 'Selecione uma opção' }),
      }"
    >
      <template #default="{ field }">
        <FormField
          label="Possui condições financeiras para cuidar do pet?"
          required
          :name="field.name"
          :errors="field.state.meta.errors"
          :touched="showErrors(field.state.meta.isTouched)"
        >
          <RadioGroup
            :model-value="boolFieldValue(field.state.value)"
            class="flex flex-row gap-6 mt-4"
            @update:model-value="
              (ev) => field.handleChange(Boolean(Number(ev)))
            "
          >
            <div class="flex items-center space-x-2">
              <RadioGroupItem
                id="hasFinancialConditions-sim"
                value="1"
                class="cursor-pointer"
              />
              <Label for="hasFinancialConditions-sim" class="cursor-pointer"
                >Sim</Label
              >
            </div>
            <div class="flex items-center space-x-2">
              <RadioGroupItem
                id="hasFinancialConditions-nao"
                value="0"
                class="cursor-pointer"
              />
              <Label for="hasFinancialConditions-nao" class="cursor-pointer"
                >Não</Label
              >
            </div>
          </RadioGroup>
        </FormField>
      </template>
    </form.Field>

    <form.Field name="enclosureType">
      <template #default="{ field }">
        <FormField
          label="Vedação do imóvel (opcional)"
          hint="Selecione todas as opções que se aplicam."
          :name="field.name"
        >
          <div class="flex flex-col gap-4.5 mt-4">
            <div
              v-for="opt in enclosureOptions"
              :key="opt.value"
              class="flex items-center space-x-2"
            >
              <Checkbox
                :id="`enclosure-${opt.value}`"
                class="cursor-pointer"
                :model-value="(field.state.value ?? []).includes(opt.value)"
                @update:model-value="
                  (checked) =>
                    field.handleChange(
                      checked
                        ? [...(field.state.value ?? []), opt.value]
                        : (field.state.value ?? []).filter(
                            (v) => v !== opt.value,
                          ),
                    )
                "
              />
              <Label :for="`enclosure-${opt.value}`" class="cursor-pointer">{{
                opt.label
              }}</Label>
            </div>
          </div>
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
        @click="dismiss()"
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
