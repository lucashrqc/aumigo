<script setup lang="ts">
import {
  Camera,
  ClipboardList,
  Database,
  Dog,
  FileChartColumn,
  FileText,
  FolderPlus,
  LayoutDashboard,
  LogOut,
  PawPrint,
  Search,
  Settings,
  Sparkles,
  Users,
} from '@lucide/vue'

import { useEventListener } from '@vueuse/core'

import NavMain from '@/components/NavMain.vue'
import NavUser from '@/components/NavUser.vue'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const logout = useLogout()
const { isMobile, setOpen, setOpenMobile } = useSidebar()

// Session user for NavUser. Avatar isn't implemented on the backend yet, so it
// falls back to an empty string (AvatarImage then shows the fallback initials).
const user = computed(() => ({
  name: auth.user?.name ?? '',
  email: auth.user?.email ?? '',
  avatar: auth.user?.image ?? '',
}))

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/admin',
      icon: LayoutDashboard,
      iconClass: 'text-blue-400',
    },
    {
      title: 'Pets',
      url: '/admin/pets',
      icon: Dog,
      iconClass: 'text-emerald-500',
    },
    {
      title: 'Candidaturas',
      url: '/admin/applications',
      icon: ClipboardList,
      iconClass: 'text-amber-400',
    },
    {
      title: 'Staff',
      url: '/admin/staff',
      icon: Users,
      iconClass: 'text-indigo-400',
      adminOnly: true,
    },
    {
      title: 'Cadastros',
      url: '#',
      icon: FolderPlus,
      iconClass: 'text-cyan-400 dark:text-cyan-600',
      items: [
        {
          title: 'Vacinas',
          url: '/admin/vaccines',
        },
        {
          title: 'Espécies',
          url: '/admin/species',
        },
        {
          title: 'Raças',
          url: '/admin/breeds',
        },
      ],
    },
  ],
  navClouds: [
    {
      title: 'Capture',
      icon: Camera,
      isActive: true,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
    {
      title: 'Proposal',
      icon: FileText,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
    {
      title: 'Prompts',
      icon: Sparkles,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: 'Configurações',
      url: '/admin/settings',
      icon: Settings,
    },
    {
      title: 'Sair',
      class: 'hover:bg-red-100 cursor-pointer',
      icon: LogOut,
      iconClass: 'text-red-400',
      onClick: () => logout(),
    },
  ],
  documents: [
    {
      name: 'Data Library',
      url: '#',
      icon: Database,
    },
    {
      name: 'Reports',
      url: '#',
      icon: FileChartColumn,
    },
    {
      name: 'Word Assistant',
      url: '#',
      icon: FileText,
    },
  ],
}

const SEARCH_INPUT_ID = 'sidebar-menu-search'
const searchQuery = ref('')

const isSearching = computed(() => searchQuery.value.trim().length > 0)

const filteredNavMain = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return data.navMain

  return data.navMain.flatMap((item) => {
    const titleMatch = item.title.toLowerCase().includes(query)

    if (item.items?.length) {
      if (titleMatch) return [item]
      const matchingSub = item.items.filter((subItem) =>
        subItem.title.toLowerCase().includes(query),
      )
      return matchingSub.length ? [{ ...item, items: matchingSub }] : []
    }

    return titleMatch ? [item] : []
  })
})

function focusSearch() {
  if (isMobile.value) setOpenMobile(true)
  else setOpen(true)
  nextTick(() => {
    const el = document.getElementById(
      SEARCH_INPUT_ID,
    ) as HTMLInputElement | null
    el?.focus()
    el?.select()
  })
}

useEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
    event.preventDefault()
    focusSearch()
  }
})
</script>

<template>
  <Sidebar collapsible="offcanvas">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            as-child
            class="data-[slot=sidebar-menu-button]:p-1.5!"
          >
            <NuxtLink
              to="/admin"
              class="flex items-center gap-2.5 h-fit hover:bg-inherit!"
            >
              <PawPrint class="size-7! text-forest" />
              <span
                class="text-[30px] tracking-[-1.4px] text-forest dark:text-brand"
                >Aumigo</span
              >
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <div class="px-1 pt-1">
        <InputGroup class="h-9 bg-background dark:bg-background">
          <InputGroupInput
            :id="SEARCH_INPUT_ID"
            v-model="searchQuery"
            type="text"
            placeholder="Buscar no menu..."
            aria-label="Buscar no menu"
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <kbd
              class="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 border px-1.5 font-mono text-[10px] font-medium select-none"
            >
              <span class="text-xs">⌘</span>K
            </kbd>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </SidebarHeader>
    <SidebarContent>
      <NavMain :items="filteredNavMain" :searching="isSearching" />
      <!-- <NavDocuments :items="data.documents" /> -->
      <NavSecondary :items="data.navSecondary" class="mt-auto">
        <template #before>
          <div class="flex justify-center px-1 pb-1">
            <ThemeSwitcher />
          </div>
        </template>
      </NavSecondary>
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="user" />
    </SidebarFooter>
  </Sidebar>
</template>
