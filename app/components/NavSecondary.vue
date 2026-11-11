<script setup lang="ts">
import type { Component } from 'vue'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

interface NavItem {
  title: string
  url?: string
  class?: string
  icon?: Component
  iconClass?: string
  onClick?: () => void
}

defineProps<{
  items: NavItem[]
}>()
</script>

<template>
  <SidebarGroup>
    <SidebarGroupContent>
      <SidebarMenu>
        <slot name="before" />
        <SidebarMenuItem v-for="item in items" :key="item.title">
          <SidebarMenuButton v-if="item.url" as-child>
            <NuxtLink :href="item.url">
              <component :is="item.icon" v-if="item.icon" />
              {{ item.title }}
            </NuxtLink>
          </SidebarMenuButton>
          <SidebarMenuButton
            v-else-if="item.onClick"
            :class="item.class"
            @click="item.onClick"
          >
            <component
              :is="item.icon"
              v-if="item.icon"
              :class="item.iconClass"
            />
            {{ item.title }}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
</template>
