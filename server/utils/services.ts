import {
  ConsoleEmailSender,
  ResendEmailSender,
  type EmailSender,
} from '../email/email-sender'
import { UrlImageStorage, type ImageStorage } from '../storage/image-storage'
import {
  DisabledBlobStorage,
  VercelBlobStorage,
  type BlobStorage,
} from '../storage/blob-storage'
import { DrizzleAdoptionApplicationRepository } from '../repositories/adoption.repository'
import { DrizzleCatalogRepository } from '../repositories/catalog.repository'
import { DrizzlePetRepository } from '../repositories/pet.repository'
import {
  DrizzleStaffInvitationRepository,
  DrizzleStaffProfileRepository,
} from '../repositories/staff.repository'
import {
  DrizzleAppliedVaccineRepository,
  DrizzleVaccineRepository,
} from '../repositories/vaccine.repository'
import { AdoptionService } from '../services/adoption.service'
import { CatalogService } from '../services/catalog.service'
import { PetService } from '../services/pet.service'
import { ProfileService } from '../services/profile.service'
import { StaffService } from '../services/staff.service'
import { VaccineService } from '../services/vaccine.service'
import { BetterAuthIdentityProvider } from './identity-provider'

/**
 * Composition root. Builds the dependency graph once per process and exposes
 * memoized service accessors. Services depend on interfaces; swapping an
 * adapter (e.g. image/email/identity) happens only here.
 */
interface Container {
  petService: PetService
  vaccineService: VaccineService
  adoptionService: AdoptionService
  staffService: StaffService
  catalogService: CatalogService
  profileService: ProfileService
  blobStorage: BlobStorage
}

let _container: Container | undefined

function buildContainer(): Container {
  const db = useDb()
  const config = useRuntimeConfig()

  const imageStorage: ImageStorage = new UrlImageStorage()
  const emailSender: EmailSender = config.resendApiKey
    ? new ResendEmailSender(config.resendApiKey, config.resendFromEmail)
    : new ConsoleEmailSender()
  const blobStorage: BlobStorage = config.blobReadWriteToken
    ? new VercelBlobStorage(config.blobReadWriteToken)
    : new DisabledBlobStorage()

  const petRepo = new DrizzlePetRepository(db)
  const vaccineRepo = new DrizzleVaccineRepository(db)
  const appliedVaccineRepo = new DrizzleAppliedVaccineRepository(db)
  const adoptionRepo = new DrizzleAdoptionApplicationRepository(db)
  const catalogRepo = new DrizzleCatalogRepository(db)
  const invitationRepo = new DrizzleStaffInvitationRepository(db)
  const profileRepo = new DrizzleStaffProfileRepository(db)
  const identityProvider = new BetterAuthIdentityProvider()

  return {
    petService: new PetService(petRepo, imageStorage),
    vaccineService: new VaccineService(vaccineRepo, appliedVaccineRepo),
    adoptionService: new AdoptionService(adoptionRepo, petRepo),
    staffService: new StaffService(
      invitationRepo,
      profileRepo,
      identityProvider,
      emailSender,
      config.public.authBaseUrl,
    ),
    catalogService: new CatalogService(catalogRepo),
    profileService: new ProfileService(profileRepo, identityProvider),
    blobStorage,
  }
}

function container(): Container {
  if (!_container) _container = buildContainer()
  return _container
}

export const usePetService = () => container().petService
export const useVaccineService = () => container().vaccineService
export const useAdoptionService = () => container().adoptionService
export const useStaffService = () => container().staffService
export const useCatalogService = () => container().catalogService
export const useProfileService = () => container().profileService
export const useBlobStorage = () => container().blobStorage
