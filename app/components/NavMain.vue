<script setup lang="ts">
import { ChevronRight } from '@lucide/vue'
import type { Component } from 'vue'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'

interface NavSubItem {
  title: string
  url: string
}

interface NavItem {
  title: string
  url: string
  icon?: Component
  isActive?: boolean
  items?: NavSubItem[]
}

withDefaults(
  defineProps<{
    items: NavItem[]
    searching?: boolean
  }>(),
  { searching: false },
)

const route = useRoute()

function isItemActive(url: string) {
  if (!url || url === '#') return false
  if (url === '/admin') return route.path === '/admin'
  return route.path === url || route.path.startsWith(`${url}/`)
}
</script>

<template>
  <SidebarGroup>
    <SidebarGroupContent class="flex flex-col gap-2">
      <SidebarMenu>
        <template v-for="item in items" :key="item.title">
          <!-- Expandable item: reveals its sub-registers on click. -->
          <Collapsible
            v-if="item.items?.length"
            as-child
            :open="searching ? true : undefined"
            :default-open="
              item.isActive ||
              item.items.some((subItem) => isItemActive(subItem.url))
            "
            class="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger as-child>
                <SidebarMenuButton :tooltip="item.title">
                  <component :is="item.icon" v-if="item.icon" />
                  <span>{{ item.title }}</span>
                  <ChevronRight
                    class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                  />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem
                    v-for="subItem in item.items"
                    :key="subItem.title"
                  >
                    <SidebarMenuSubButton
                      as-child
                      :is-active="isItemActive(subItem.url)"
                    >
                      <NuxtLink :to="subItem.url">
                        <span>{{ subItem.title }}</span>
                      </NuxtLink>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>

          <!-- Plain link item. -->
          <SidebarMenuItem v-else>
            <SidebarMenuButton
              as-child
              :tooltip="item.title"
              :is-active="isItemActive(item.url)"
            >
              <NuxtLink :to="item.url">
                <component :is="item.icon" v-if="item.icon" />
                <span>{{ item.title }}</span>
              </NuxtLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </template>

        <SidebarMenuItem v-if="searching && !items.length">
          <div class="text-muted-foreground px-2 py-1.5 text-sm">
            Nenhum resultado
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
</template>
