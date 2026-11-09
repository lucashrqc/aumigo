import AdoptionApplicationForm from '@/components/AdoptionApplicationForm.vue'
import AuthGateDialog from '@/components/AuthGateDialog.vue'
import useDialog from '@/composables/useDialog'
import { useAuthStore } from '@/stores/auth'

export interface AdoptionFlowPet {
  id?: string
  name: string
  demo?: boolean
}

// Keep the landing palette on both dialogs regardless of the viewer's theme:
// these surfaces belong to the brand/landing experience, not the app chrome.
const dialogProps = { class: 'max-w-md bg-white text-forest border-brand' }

export function useAdoptionFlow() {
  const auth = useAuthStore()
  const dialog = useDialog()

  async function startApplication(pet: AdoptionFlowPet) {
    if (!auth.isAuthenticated) {
      const authed = await dialog.open<boolean>(AuthGateDialog, {
        dialogProps,
        props: { petName: pet.name },
      })
      if (!authed || !auth.isAuthenticated) return
    }

    await dialog.open(AdoptionApplicationForm, {
      dialogProps,
      props: { petId: pet.id, petName: pet.name, demo: pet.demo },
    })
  }

  return { startApplication }
}
