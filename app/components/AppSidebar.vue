<script setup lang="ts">
import {
  Camera,
  CircleQuestionMark,
  ClipboardList,
  Database,
  Dog,
  FileChartColumn,
  FileText,
  FolderPlus,
  LayoutDashboard,
  PawPrint,
  Search,
  Settings,
  Sparkles,
  Users,
} from '@lucide/vue'

import NavMain from '@/components/NavMain.vue'
import NavUser from '@/components/NavUser.vue'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

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
    },
    {
      title: 'Pets',
      url: '/admin/pets',
      icon: Dog,
    },
    {
      title: 'Candidaturas',
      url: '/admin/applications',
      icon: ClipboardList,
    },
    {
      title: 'Staff',
      url: '/admin/staff',
      icon: Users,
      adminOnly: true,
    },
    {
      title: 'Cadastros',
      url: '#',
      icon: FolderPlus,
      items: [
        {
          title: 'Vacinas',
          url: '/admin/cadastro/vacinas',
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
      title: 'Settings',
      url: '#',
      icon: Settings,
    },
    {
      title: 'Get Help',
      url: '#',
      icon: CircleQuestionMark,
    },
    {
      title: 'Search',
      url: '#',
      icon: Search,
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
</script>

<template>
  <Sidebar collapsible="offcanvas">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            as-child
            class="data-[slot=sidebar-menu-button]:!p-1.5"
          >
            <a href="#">
              <PawPrint class="size-6!" />
              <span class="text-base font-semibold">Aumor</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <NavMain :items="data.navMain" />
      <!-- <NavDocuments :items="data.documents" /> -->
      <!-- <NavSecondary :items="data.navSecondary" class="mt-auto" /> -->
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="user" />
    </SidebarFooter>
  </Sidebar>
</template>
