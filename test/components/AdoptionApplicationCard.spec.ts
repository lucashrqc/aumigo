import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import type { AdoptionApplicationDto } from '#shared/types'
import AdoptionApplicationCard from '@/components/AdoptionApplicationCard.vue'

const { openSpy } = vi.hoisted(() => ({ openSpy: vi.fn() }))

vi.mock('@/composables/useDialog', () => ({
  default: () => ({ open: openSpy, close: vi.fn() }),
}))

vi.mock('@/components/PetGalleryDialog.vue', () => ({
  default: defineComponent({ name: 'PetGalleryDialog', render: () => null }),
}))

const Badge = defineComponent({
  name: 'Badge',
  props: { variant: { type: String, default: undefined } },
  setup: (props, { slots, attrs }) =>
    () => h('span', { 'data-testid': 'badge', 'data-variant': props.variant, ...attrs }, slots.default?.()),
})

const Button = defineComponent({
  name: 'Button',
  props: { disabled: { type: Boolean, default: false } },
  emits: ['click'],
  setup: (props, { slots, emit }) =>
    () =>
      h(
        'button',
        { disabled: props.disabled, onClick: () => emit('click') },
        slots.default?.(),
      ),
})

const NuxtLink = defineComponent({
  name: 'NuxtLink',
  props: { to: { type: String, default: '' } },
  setup: (props, { slots }) => () => h('a', { href: props.to }, slots.default?.()),
})

function makeApplication(
  overrides: Partial<AdoptionApplicationDto> = {},
): AdoptionApplicationDto {
  return {
    id: 'app-1',
    petId: 'pet-1',
    adopterUserId: 'user-1',
    document: null,
    contactPhone: null,
    message: null,
    age: 30,
    home: 'house',
    cityId: 'city-1',
    street: null,
    number: null,
    neighborhood: null,
    complement: null,
    zipCode: null,
    isRental: false,
    allowPets: null,
    firstPet: true,
    hasFinancialConditions: true,
    enclosureType: null,
    acceptedTerms: true,
    status: 'pending',
    reviewedAt: null,
    rejectReason: null,
    rejectedAt: null,
    canceledAt: null,
    createdAt: '2026-01-15T12:00:00.000Z',
    city: null,
    pet: {
      id: 'pet-1',
      name: 'Rex',
      status: 'available',
      size: 'medium',
      images: [{ id: 'img-1', url: 'https://example.com/rex.jpg' }] as never,
    },
    adopter: null,
    ...overrides,
  }
}

function mountCard(application: AdoptionApplicationDto) {
  return mount(AdoptionApplicationCard, {
    props: { application },
    global: { stubs: { Badge, Button, NuxtLink } },
  })
}

describe('AdoptionApplicationCard', () => {
  it('renders the pet name, meta line and submission date', () => {
    const wrapper = mountCard(makeApplication())
    expect(wrapper.text()).toContain('Rex')
    expect(wrapper.text()).toContain('Porte Médio')
    expect(wrapper.text()).toContain('Enviada em')
  })

  it('shows a success badge with a check icon for approved applications', () => {
    const wrapper = mountCard(makeApplication({ status: 'approved' }))
    const badge = wrapper.get('[data-testid="badge"]')
    expect(badge.attributes('data-variant')).toBe('success')
    expect(badge.text()).toContain('Aprovada')
    expect(wrapper.find('.lucide-check').exists()).toBe(true)
  })

  it('softens the rejected badge and shows the rejection reason when present', () => {
    const wrapper = mountCard(
      makeApplication({ status: 'rejected', rejectReason: 'Perfil incompatível' }),
    )
    const badge = wrapper.get('[data-testid="badge"]')
    expect(badge.classes()).toContain('bg-red-100')
    expect(badge.classes()).toContain('text-red-700')
    expect(badge.classes()).not.toContain('bg-destructive')
    expect(wrapper.text()).toContain('Motivo da recusa')
    expect(wrapper.text()).toContain('Perfil incompatível')
  })

  it('omits the rejection reason block when there is no reason', () => {
    const wrapper = mountCard(
      makeApplication({ status: 'rejected', rejectReason: null }),
    )
    expect(wrapper.text()).not.toContain('Motivo da recusa')
  })

  it('disables the gallery button when the pet has no images', () => {
    const wrapper = mountCard(
      makeApplication({
        pet: { id: 'pet-1', name: 'Rex', status: 'available', images: [] },
      }),
    )
    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
  })

  it('opens the gallery dialog when the gallery button is clicked', async () => {
    const wrapper = mountCard(makeApplication())
    await wrapper.get('button').trigger('click')
    expect(openSpy).toHaveBeenCalledTimes(1)
  })

  it('renders the applicant message when present', () => {
    const withMessage = mountCard(makeApplication({ message: 'Amo animais' }))
    expect(withMessage.text()).toContain('Sua mensagem')
    expect(withMessage.text()).toContain('Amo animais')

    const withoutMessage = mountCard(makeApplication({ message: null }))
    expect(withoutMessage.text()).not.toContain('Sua mensagem')
  })
})
