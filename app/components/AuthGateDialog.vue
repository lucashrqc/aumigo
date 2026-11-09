<script setup lang="ts">
import { PawPrint } from '@lucide/vue'
import useDialog from '@/composables/useDialog'

defineProps<{ petName?: string }>()

const { close } = useDialog()
const view = ref<'choice' | 'login' | 'register'>('choice')

function onAuthed() {
  close(true)
}
</script>

<template>
  <div class="flex flex-col gap-6 text-forest">
    <DialogTitle class="sr-only">Entrar ou criar conta</DialogTitle>
    <DialogDescription class="sr-only">
      Acesse sua conta para continuar com a adoção.
    </DialogDescription>

    <div class="flex items-center gap-2.5">
      <PawPrint class="size-6.5 text-forest" />
      <span class="text-[26px] tracking-[-1.2px] text-forest">aumigo</span>
    </div>

    <Transition name="auth-view" mode="out-in">
      <div v-if="view === 'choice'" key="choice" class="flex flex-col gap-5">
        <div class="flex flex-col gap-2">
          <span class="text-[11px] font-semibold tracking-[1.6px] text-forest">
            QUASE LÁ
          </span>
          <h2 class="text-[24px] font-semibold tracking-[-0.6px] text-forest">
            Entre para continuar
          </h2>
          <p class="text-[14px] leading-[1.5] text-text-soft">
            <template v-if="petName"
              >Falta pouco para você conhecer {{ petName }}. </template
            >Entre ou crie sua conta para seguir com a adoção.
          </p>
        </div>
        <div class="flex flex-col gap-3">
          <Button
            class="h-12 w-full rounded-xl bg-forest text-[14px] font-semibold text-white hover:bg-forest/90"
            @click="view = 'login'"
          >
            Entrar
          </Button>
          <Button
            variant="outline"
            class="h-12 w-full rounded-xl border-brand bg-white text-[14px] font-semibold text-forest hover:bg-cream-soft hover:text-forest"
            @click="view = 'register'"
          >
            Criar conta
          </Button>
        </div>
      </div>

      <div
        v-else-if="view === 'login'"
        key="login"
        class="flex flex-col gap-5"
      >
        <div class="flex flex-col gap-1.5">
          <h2 class="text-[24px] font-semibold tracking-[-0.6px] text-forest">
            Entrar
          </h2>
          <p class="text-[14px] text-text-soft">
            Bem-vindo de volta à Aumigo.
          </p>
        </div>
        <LoginForm @success="onAuthed" />
        <p class="text-center text-[14px] text-forest">
          Não tem conta?
          <button
            type="button"
            class="font-semibold underline"
            @click="view = 'register'"
          >
            Crie uma.
          </button>
        </p>
      </div>

      <div v-else key="register" class="flex flex-col gap-5">
        <div class="flex flex-col gap-1.5">
          <h2 class="text-[24px] font-semibold tracking-[-0.6px] text-forest">
            Crie sua conta
          </h2>
          <p class="text-[14px] text-text-soft">Cadastre-se para adotar um pet.</p>
        </div>
        <RegisterForm @success="onAuthed" />
        <p class="text-center text-[14px] text-forest">
          Já tem conta?
          <button
            type="button"
            class="font-semibold underline"
            @click="view = 'login'"
          >
            Entre aqui.
          </button>
        </p>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.auth-view-enter-active,
.auth-view-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.auth-view-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.auth-view-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
