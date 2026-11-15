<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { EllipsisVertical, LogOut } from '@lucide/vue'
import { authClient } from '~/lib/auth-client'

interface User {
  name: string
  email: string
  image: string
  role: string
}

const auth = useAuthStore()

const props = defineProps<{
  useLightTheme: boolean
  informative: boolean
}>()

const roleLabelMap = {
  admin: 'Admin',
  adopter: 'Adotante',
  staff: 'Staff',
}

const user = computed<User>(() => ({
  name: auth.user?.name ?? '',
  email: auth.user?.email ?? '',
  image: auth.user?.image ?? '',
  role: auth.user?.role ? roleLabelMap[auth.user.role] : '',
}))

const btnLightTheme = computed(() =>
  props.useLightTheme
    ? 'text-forest! hover:bg-cream-soft! hover:text-forest!'
    : '',
)

async function logout() {
  await authClient.signOut()
  auth.setUser(null)
  await navigateTo('/')
}
</script>

<template>
  <template v-if="props.informative">
    <Avatar class="h-8 w-8 rounded-lg">
      <AvatarImage :src="user.image" :alt="user.name" />
      <AvatarFallback
        class="rounded-lg"
        :class="props.useLightTheme ? 'bg-cream-soft' : ''"
      >
        {{ getInitials(user.name) }}
      </AvatarFallback>
    </Avatar>
    <div class="grid flex-1 text-left text-sm leading-tight">
      <span class="text-forest truncate">
        {{ user.name }}
      </span>
      <span class="text-muted-foreground truncate text-xs">
        {{ user.role }}
      </span>
    </div>
    <EllipsisVertical v-if="!props.informative" class="ml-auto size-4" />
  </template>

  <DropdownMenu v-else>
    <DropdownMenuTrigger as-child>
      <Button
        variant="ghost"
        class="p-0! group size-fit min-w-46"
        :class="btnLightTheme"
      >
        <Avatar class="h-8 w-8 rounded-lg">
          <AvatarImage :src="user.image" :alt="user.name" />
          <AvatarFallback
            class="rounded-lg"
            :class="props.useLightTheme ? 'bg-cream-soft' : ''"
          >
            {{ getInitials(user.name) }}
          </AvatarFallback>
        </Avatar>
        <div class="grid flex-1 text-left text-sm leading-tight">
          <span class="text-forest truncate">
            {{ user.name }}
          </span>
          <span class="text-muted-foreground truncate text-xs">
            {{ user.role }}
          </span>
        </div>
        <EllipsisVertical class="ml-auto size-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      class="w-(--reka-dropdown-menu-trigger-width) min-w-56 rounded-lg"
      :class="props.useLightTheme ? 'bg-white text-forest' : ''"
      :side-offset="4"
      side="bottom"
      align="end"
    >
      <DropdownMenuGroup>
        <DropdownMenuItem
          :class="btnLightTheme"
          @select="navigateTo('/applications')"
        >
          <Settings />
          Minhas candidaturas
        </DropdownMenuItem>
        <DropdownMenuItem
          v-if="auth.isAdmin"
          :class="btnLightTheme"
          @select="navigateTo('/admin')"
        >
          <Settings />
          Painel admin
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator
        :class="props.useLightTheme ? 'bg-cream-soft' : ''"
      />
      <DropdownMenuItem
        :class="props.useLightTheme ? 'text-red-400! hover:bg-red-50!' : ''"
        @select="logout"
      >
        <LogOut class="text-red-600 dark:text-red-400" />
        Sair
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
