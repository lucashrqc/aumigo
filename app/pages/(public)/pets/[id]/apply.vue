<script setup lang="ts">
import { computed } from 'vue'
import AdoptionApplicationForm from '@/components/AdoptionApplicationForm.vue'

definePageMeta({ layout: 'public', middleware: 'auth' })
useSeoMeta({ robots: 'noindex, nofollow' })

const route = useRoute()
const petId = computed(() => route.params.id as string)

const { data: pet } = usePublicPetQuery(() => petId.value)
const petName = computed(() => pet.value?.name ?? '')

useHead({
  title: () =>
    petName.value
      ? `Candidatar-se para adotar ${petName.value} — Aumigo`
      : 'Candidatar-se para adotar — Aumigo',
})
</script>

<template>
  <div class="flex flex-col gap-8">
    <section class="relative -mt-8 ml-[calc(50%-50vw)] w-screen bg-cream-soft">
      <div class="container mx-auto px-4">
        <div class="mx-auto max-w-3xl py-12 md:py-14">
          <span
            class="text-[11px] font-semibold tracking-[1.6px] text-forest/70"
          >
            O COMEÇO DE UMA NOVA HISTÓRIA
          </span>
          <h1
            class="mt-3 text-[32px] font-semibold leading-[1.1] tracking-[-1px] text-forest md:text-[40px]"
          >
            {{
              petName
                ? `Candidatar-se para adotar ${petName}`
                : 'Candidatar-se para adotar'
            }}
          </h1>
          <p class="mt-3 max-w-xl text-[16px] text-text-soft">
            Preencha os dados abaixo. Nossa equipe analisa cada candidatura com
            cuidado.
          </p>
        </div>
      </div>
    </section>

    <div class="mx-auto w-full max-w-3xl">
      <AdoptionApplicationForm
        variant="page"
        :pet-id="petId"
        :pet-name="petName"
      />
    </div>
  </div>
</template>
