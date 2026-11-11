<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { Heart, PawPrint } from '@lucide/vue'
import { computed } from 'vue'

const auth = useAuthStore()

const footerColumns = computed(() => [
  {
    title: 'Encontre seu pet',
    links: [
      { label: 'Cães para adoção', to: '/pets' },
      { label: 'Gatos para adoção', to: '/pets' },
      { label: 'Como adotar', to: '/#como-adotar' },
    ],
  },
  {
    title: 'Adote com carinho',
    links: [
      { label: 'Adoção responsável', to: '/#adocao-responsavel' },
      { label: 'Dúvidas frequentes', to: '/#duvidas' },
      { label: 'Prepare seu lar', to: '/#adocao-responsavel' },
    ],
  },
  {
    title: 'Seu Aumigo',
    links: auth.isAuthenticated
      ? [
          { label: 'Minhas candidaturas', to: '/applications' },
          ...(auth.isStaff ? [{ label: 'Admin', to: '/admin' }] : []),
        ]
      : [
          { label: 'Entrar', to: '/login' },
          { label: 'Criar conta', to: '/register' },
        ],
  },
])
</script>

<template>
  <footer class="px-6 pb-8 pt-14 md:px-10 lg:px-24">
    <div class="mx-auto max-w-312">
      <div class="flex flex-col gap-10 lg:flex-row lg:justify-between">
        <div class="flex max-w-[320px] flex-col gap-4">
          <div class="flex items-center gap-2.5">
            <PawPrint class="size-7 text-forest" />
            <span class="text-[30px] tracking-[-1.4px] text-forest"
              >Aumigo</span
            >
          </div>
          <p class="text-[14px] leading-[1.6] text-text-soft">
            Conectando histórias, aproximando vidas. Um encontro de cada vez.
          </p>
        </div>
        <div class="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:flex lg:gap-20">
          <div
            v-for="col in footerColumns"
            :key="col.title"
            class="flex flex-col gap-4"
          >
            <span class="text-[14px] font-semibold text-forest">{{
              col.title
            }}</span>
            <NuxtLink
              v-for="link in col.links"
              :key="link.label"
              :to="link.to"
              class="text-[13px] text-text-soft transition-colors hover:text-forest"
            >
              {{ link.label }}
            </NuxtLink>
          </div>
        </div>
      </div>
      <div
        class="mt-12 flex flex-col gap-4 border-t border-brand pt-6 text-[12px] text-text-soft sm:flex-row sm:items-center sm:justify-between"
      >
        <span>© 2026 Aumigo</span>
        <div class="flex gap-6">
          <a href="#" class="transition-colors hover:text-forest"
            >Privacidade</a
          >
          <a href="#" class="transition-colors hover:text-forest"
            >Termos de uso</a
          >
        </div>
        <span class="flex items-center gap-1.5">
          <Heart class="size-3.25" />
          O amor encontra um lar.
        </span>
      </div>
    </div>
  </footer>
</template>
