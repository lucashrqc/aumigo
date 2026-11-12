import { createEmailSender, type EmailSender } from '../email/email-sender'
import { UrlImageStorage, type ImageStorage } from '../storage/image-storage'
import {
  DisabledBlobStorage,
  VercelBlobStorage,
  type BlobStorage,
} from '../storage/blob-storage'
import { DrizzleAddressRepository } from '../repositories/address.repository'
import { DrizzleAdoptionApplicationRepository } from '../repositories/adoption.repository'
import { DrizzleAnalyticsRepository } from '../repositories/analytics.repository'
import { DrizzleCatalogRepository } from '../repositories/catalog.repository'
import { DrizzleLocationRepository } from '../repositories/location.repository'
import { DrizzleMaintenanceRepository } from '../repositories/maintenance.repository'
import { DrizzlePetRepository } from '../repositories/pet.repository'
import {
  DrizzleStaffInvitationRepository,
  DrizzleStaffProfileRepository,
} from '../repositories/staff.repository'
import { DrizzleUserRepository } from '../repositories/user.repository'
import {
  DrizzleAppliedVaccineRepository,
  DrizzleVaccineRepository,
} from '../repositories/vaccine.repository'
import { AddressService } from '../services/address.service'
import { AdoptionService } from '../services/adoption.service'
import { AnalyticsService } from '../services/analytics.service'
import { CatalogService } from '../services/catalog.service'
import { LocationService } from '../services/location.service'
import { MaintenanceService } from '../services/maintenance.service'
import { PetService } from '../services/pet.service'
import { ProfileService } from '../services/profile.service'
import { StaffService } from '../services/staff.service'
import { UserService } from '../services/user.service'
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
  analyticsService: AnalyticsService
  staffService: StaffService
  userService: UserService
  catalogService: CatalogService
  locationService: LocationService
  profileService: ProfileService
  addressService: AddressService
  maintenanceService: MaintenanceService
  blobStorage: BlobStorage
}

let _container: Container | undefined

function buildContainer(): Container {
  const db = useDb()
  const config = useRuntimeConfig()

  const imageStorage: ImageStorage = new UrlImageStorage()
  const emailSender: EmailSender = createEmailSender({
    provider: config.emailProvider,
    smtp: {
      host: config.smtpHost,
      port: config.smtpPort,
      user: config.smtpUser,
      pass: config.smtpPass,
      from: config.smtpFrom,
    },
    resend: { apiKey: config.resendApiKey, from: config.resendFromEmail },
  })
  const blobStorage: BlobStorage = config.blobReadWriteToken
    ? new VercelBlobStorage(config.blobReadWriteToken)
    : new DisabledBlobStorage()

  const petRepo = new DrizzlePetRepository(db)
  const vaccineRepo = new DrizzleVaccineRepository(db)
  const appliedVaccineRepo = new DrizzleAppliedVaccineRepository(db)
  const adoptionRepo = new DrizzleAdoptionApplicationRepository(db)
  const analyticsRepo = new DrizzleAnalyticsRepository(db)
  const catalogRepo = new DrizzleCatalogRepository(db)
  const locationRepo = new DrizzleLocationRepository(db)
  const addressRepo = new DrizzleAddressRepository(db)
  const invitationRepo = new DrizzleStaffInvitationRepository(db)
  const profileRepo = new DrizzleStaffProfileRepository(db)
  const maintenanceRepo = new DrizzleMaintenanceRepository(db)
  const userRepo = new DrizzleUserRepository(db)
  const identityProvider = new BetterAuthIdentityProvider()

  return {
    petService: new PetService(
      petRepo,
      imageStorage,
      adoptionRepo,
      vaccineRepo,
    ),
    vaccineService: new VaccineService(vaccineRepo, appliedVaccineRepo),
    adoptionService: new AdoptionService(adoptionRepo, petRepo),
    analyticsService: new AnalyticsService(analyticsRepo),
    staffService: new StaffService(
      invitationRepo,
      profileRepo,
      identityProvider,
      emailSender,
      config.public.authBaseUrl,
    ),
    userService: new UserService(userRepo),
    catalogService: new CatalogService(catalogRepo),
    locationService: new LocationService(locationRepo),
    profileService: new ProfileService(profileRepo, identityProvider),
    addressService: new AddressService(addressRepo, profileRepo),
    maintenanceService: new MaintenanceService(blobStorage, maintenanceRepo),
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
export const useAnalyticsService = () => container().analyticsService
export const useStaffService = () => container().staffService
export const useUserService = () => container().userService
export const useCatalogService = () => container().catalogService
export const useLocationService = () => container().locationService
export const useProfileService = () => container().profileService
export const useAddressService = () => container().addressService
export const useMaintenanceService = () => container().maintenanceService
export const useBlobStorage = () => container().blobStorage
