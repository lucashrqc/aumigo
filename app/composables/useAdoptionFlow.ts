import AuthGateDialog from '@/components/AuthGateDialog.vue'
import useDialog from '@/composables/useDialog'
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/stores/auth'
import {
  useEnsureMyApplications,
  isActiveApplication,
} from '@/composables/useApplications'

export interface AdoptionFlowPet {
  id?: string
  name: string
}

// Keep the landing palette on the auth gate regardless of the viewer's theme:
// this surface belongs to the brand/landing experience, not the app chrome.
const dialogProps = { class: 'max-w-md bg-white text-forest border-brand' }

export function useAdoptionFlow() {
  const auth = useAuthStore()
  const dialog = useDialog()
  const ensureApplications = useEnsureMyApplications()

  async function startApplication(pet: AdoptionFlowPet) {
    // Landing cards can be illustrative and carry no real pet id yet.
    if (!pet.id) {
      toast.info('Em breve você poderá se candidatar à adoção por aqui.')
      return
    }

    if (!auth.isAuthenticated) {
      const authed = await dialog.open<boolean>(AuthGateDialog, {
        dialogProps,
        props: { petName: pet.name },
      })
      if (!authed || !auth.isAuthenticated) return
    }

    const apps = await ensureApplications()
    if (apps.some((a) => a.petId === pet.id && isActiveApplication(a))) {
      toast.warning('Você já tem uma candidatura em andamento para este pet.')
      return
    }

    await navigateTo(`/pets/${pet.id}/apply`)
  }

  return { startApplication }
}
