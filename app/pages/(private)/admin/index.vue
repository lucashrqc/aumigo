<script setup lang="ts">
import { CircleCheck, Loader, MenuIcon } from '@lucide/vue'
import { createColumnHelper } from '@tanstack/vue-table'
import type { Features } from '~/components/features'
import Badge from '~/components/ui/badge/Badge.vue'
import Button from '~/components/ui/button/Button.vue'
import Checkbox from '~/components/ui/checkbox/Checkbox.vue'
import DropdownMenu from '~/components/ui/dropdown-menu/DropdownMenu.vue'
import DropdownMenuContent from '~/components/ui/dropdown-menu/DropdownMenuContent.vue'
import DropdownMenuItem from '~/components/ui/dropdown-menu/DropdownMenuItem.vue'
import DropdownMenuSeparator from '~/components/ui/dropdown-menu/DropdownMenuSeparator.vue'
import DropdownMenuTrigger from '~/components/ui/dropdown-menu/DropdownMenuTrigger.vue'
import Select from '~/components/ui/select/Select.vue'
import SelectContent from '~/components/ui/select/SelectContent.vue'
import SelectItem from '~/components/ui/select/SelectItem.vue'
import SelectTrigger from '~/components/ui/select/SelectTrigger.vue'
import SelectValue from '~/components/ui/select/SelectValue.vue'

definePageMeta({ layout: 'private', middleware: 'staff' })
useHead({ title: 'Admin — Aumor' })

// const { data: pets } = useAdminPetsQuery(() => ({ pageSize: 1 }))
// const { data: applications } = useAdminApplicationsQuery(() => ({ status: 'pending', pageSize: 1 }))

const data = [
  {
    id: 1,
    header: 'Cover page',
    type: 'Cover page',
    status: 'In Process',
    target: '18',
    limit: '5',
    reviewer: 'Eddie Lake',
  },
  {
    id: 2,
    header: 'Table of contents',
    type: 'Table of contents',
    status: 'Done',
    target: '29',
    limit: '24',
    reviewer: 'Eddie Lake',
  },
  {
    id: 3,
    header: 'Executive summary',
    type: 'Narrative',
    status: 'Done',
    target: '10',
    limit: '13',
    reviewer: 'Eddie Lake',
  },
  {
    id: 4,
    header: 'Technical approach',
    type: 'Narrative',
    status: 'Done',
    target: '27',
    limit: '23',
    reviewer: 'Jamik Tashpulatov',
  },
  {
    id: 5,
    header: 'Design',
    type: 'Narrative',
    status: 'In Process',
    target: '2',
    limit: '16',
    reviewer: 'Jamik Tashpulatov',
  },
  {
    id: 6,
    header: 'Capabilities',
    type: 'Narrative',
    status: 'In Process',
    target: '20',
    limit: '8',
    reviewer: 'Jamik Tashpulatov',
  },
  {
    id: 7,
    header: 'Integration with existing systems',
    type: 'Narrative',
    status: 'In Process',
    target: '19',
    limit: '21',
    reviewer: 'Jamik Tashpulatov',
  },
  {
    id: 8,
    header: 'Innovation and Advantages',
    type: 'Narrative',
    status: 'Done',
    target: '25',
    limit: '26',
    reviewer: 'Assign reviewer',
  },
  {
    id: 9,
    header: "Overview of EMR's Innovative Solutions",
    type: 'Technical content',
    status: 'Done',
    target: '7',
    limit: '23',
    reviewer: 'Assign reviewer',
  },
  {
    id: 10,
    header: 'Advanced Algorithms and Machine Learning',
    type: 'Narrative',
    status: 'Done',
    target: '30',
    limit: '28',
    reviewer: 'Assign reviewer',
  },
  {
    id: 11,
    header: 'Adaptive Communication Protocols',
    type: 'Narrative',
    status: 'Done',
    target: '9',
    limit: '31',
    reviewer: 'Assign reviewer',
  },
  {
    id: 12,
    header: 'Advantages Over Current Technologies',
    type: 'Narrative',
    status: 'Done',
    target: '12',
    limit: '0',
    reviewer: 'Assign reviewer',
  },
  {
    id: 13,
    header: 'Past Performance',
    type: 'Narrative',
    status: 'Done',
    target: '22',
    limit: '33',
    reviewer: 'Assign reviewer',
  },
  {
    id: 14,
    header: 'Customer Feedback and Satisfaction Levels',
    type: 'Narrative',
    status: 'Done',
    target: '15',
    limit: '34',
    reviewer: 'Assign reviewer',
  },
  {
    id: 15,
    header: 'Implementation Challenges and Solutions',
    type: 'Narrative',
    status: 'Done',
    target: '3',
    limit: '35',
    reviewer: 'Assign reviewer',
  },
  {
    id: 16,
    header: 'Security Measures and Data Protection Policies',
    type: 'Narrative',
    status: 'In Process',
    target: '6',
    limit: '36',
    reviewer: 'Assign reviewer',
  },
  {
    id: 17,
    header: 'Scalability and Future Proofing',
    type: 'Narrative',
    status: 'Done',
    target: '4',
    limit: '37',
    reviewer: 'Assign reviewer',
  },
  {
    id: 18,
    header: 'Cost-Benefit Analysis',
    type: 'Plain language',
    status: 'Done',
    target: '14',
    limit: '38',
    reviewer: 'Assign reviewer',
  },
  {
    id: 19,
    header: 'User Training and Onboarding Experience',
    type: 'Narrative',
    status: 'Done',
    target: '17',
    limit: '39',
    reviewer: 'Assign reviewer',
  },
  {
    id: 20,
    header: 'Future Development Roadmap',
    type: 'Narrative',
    status: 'Done',
    target: '11',
    limit: '40',
    reviewer: 'Assign reviewer',
  },
  {
    id: 21,
    header: 'System Architecture Overview',
    type: 'Technical content',
    status: 'In Process',
    target: '24',
    limit: '18',
    reviewer: 'Maya Johnson',
  },
  {
    id: 22,
    header: 'Risk Management Plan',
    type: 'Narrative',
    status: 'Done',
    target: '15',
    limit: '22',
    reviewer: 'Carlos Rodriguez',
  },
  {
    id: 23,
    header: 'Compliance Documentation',
    type: 'Legal',
    status: 'In Process',
    target: '31',
    limit: '27',
    reviewer: 'Sarah Chen',
  },
  {
    id: 24,
    header: 'API Documentation',
    type: 'Technical content',
    status: 'Done',
    target: '8',
    limit: '12',
    reviewer: 'Raj Patel',
  },
  {
    id: 25,
    header: 'User Interface Mockups',
    type: 'Visual',
    status: 'In Process',
    target: '19',
    limit: '25',
    reviewer: 'Leila Ahmadi',
  },
  {
    id: 26,
    header: 'Database Schema',
    type: 'Technical content',
    status: 'Done',
    target: '22',
    limit: '20',
    reviewer: 'Thomas Wilson',
  },
  {
    id: 27,
    header: 'Testing Methodology',
    type: 'Technical content',
    status: 'In Process',
    target: '17',
    limit: '14',
    reviewer: 'Assign reviewer',
  },
  {
    id: 28,
    header: 'Deployment Strategy',
    type: 'Narrative',
    status: 'Done',
    target: '26',
    limit: '30',
    reviewer: 'Eddie Lake',
  },
  {
    id: 29,
    header: 'Budget Breakdown',
    type: 'Financial',
    status: 'In Process',
    target: '13',
    limit: '16',
    reviewer: 'Jamik Tashpulatov',
  },
  {
    id: 30,
    header: 'Market Analysis',
    type: 'Research',
    status: 'Done',
    target: '29',
    limit: '32',
    reviewer: 'Sophia Martinez',
  },
]

interface TableData {
  id: number
  header: string
  type: string
  status: string
  target: string
  limit: string
  reviewer: string
}

const columnHelper = createColumnHelper<Features, TableData>()
const columns = columnHelper.columns([
  columnHelper.display({
    id: 'select',
    header: ({ table }) =>
      h(Checkbox, {
        modelValue:
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate'),
        'onUpdate:modelValue': (value) => table.toggleAllPageRowsSelected(!!value),
        'aria-label': 'Select all',
      }),
    cell: ({ row }) =>
      h(Checkbox, {
        modelValue: row.getIsSelected(),
        'onUpdate:modelValue': (value) => row.toggleSelected(!!value),
        'aria-label': 'Select row',
      }),
    enableSorting: false,
    enableHiding: false,
  }),
  columnHelper.accessor('header', {
    header: 'Header',
    cell: ({ row }) => h('div', String(row.getValue('header'))),
    enableHiding: false,
  }),
  columnHelper.accessor('type', {
    header: 'Section Type',
    cell: ({ row }) =>
      h(
        Badge,
        {
          variant: 'outline',
        },
        () => String(row.getValue('type')),
      ),
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return h('div', { class: 'flex items-center gap-2' }, [
        status === 'Done'
          ? h(CircleCheck, { class: 'h-4 w-4 text-emerald-500' })
          : h(Loader, { class: 'h-4 w-4 animate-spin text-muted-foreground' }),
        h('span', {}, status),
      ])
    },
  }),
  columnHelper.accessor('target', {
    header: () => h('div', { class: 'flex items-center gap-1' }, ['Target']),
    cell: ({ row }) =>
      h(
        Button,
        {
          variant: 'ghost',
          size: 'sm',
          class: 'h-auto p-1 text-xs font-mono',
        },
        () => [h('span', { class: 'ml-1 font-semibold' }, String(row.getValue('target')))],
      ),
  }),
  columnHelper.accessor('limit', {
    header: () => h('div', { class: 'flex items-center gap-1' }, ['Limit']),
    cell: ({ row }) =>
      h(
        Button,
        {
          variant: 'ghost',
          size: 'sm',
          class: 'h-auto p-1 text-xs font-mono',
        },
        () => [h('span', { class: 'ml-1 font-semibold' }, String(row.getValue('limit')))],
      ),
  }),
  columnHelper.accessor('reviewer', {
    header: 'Reviewer',
    cell: ({ row }) => {
      const reviewer = row.getValue('reviewer') as string
      const isAssigned = reviewer !== 'Assign reviewer'
      if (isAssigned) {
        return h('span', {}, reviewer)
      }
      return h(
        Select,
        {},
        {
          default: () => [
            h(
              SelectTrigger,
              { class: 'w-full' },
              {
                default: () => h(SelectValue, { placeholder: 'Assign reviewer' }),
              },
            ),
            h(
              SelectContent,
              {},
              {
                default: () => [
                  h(SelectItem, { value: 'eddie' }, () => 'Eddie Lake'),
                  h(SelectItem, { value: 'jamik' }, () => 'Jamik Tashpulatov'),
                ],
              },
            ),
          ],
        },
      )
    },
  }),
  columnHelper.display({
    id: 'actions',
    cell: () =>
      h(
        DropdownMenu,
        {},
        {
          default: () => [
            h(
              DropdownMenuTrigger,
              { asChild: true },
              {
                default: () =>
                  h(
                    Button,
                    {
                      variant: 'ghost',
                      class: 'h-8 w-8 p-0',
                    },
                    {
                      default: () => [
                        h('span', { class: 'sr-only' }, 'Open menu'),
                        h(MenuIcon, { class: 'h-4 w-4' }),
                      ],
                    },
                  ),
              },
            ),
            h(
              DropdownMenuContent,
              { align: 'end' },
              {
                default: () => [
                  h(DropdownMenuItem, {}, () => 'Edit'),
                  h(DropdownMenuItem, {}, () => 'Make a copy'),
                  h(DropdownMenuItem, {}, () => 'Favorite'),
                  h(DropdownMenuSeparator, {}),
                  h(DropdownMenuItem, {}, () => 'Delete'),
                ],
              },
            ),
          ],
        },
      ),
  }),
])
</script>

<template>
  <div class="flex flex-col gap-4 md:gap-6">
    <SectionCards />
    <div class="flex flex-col gap-6">
      <ChartAreaInteractive />
      <DataTable :columns="columns" :data="data" />
    </div>
  </div>
</template>
