/** Response DTOs shared between the Nuxt server and client. */

export * from './maintenance'

/** Minimal staff user reference, used for audit columns (created/updated by). */
export interface AuditUserDto {
  id: string
  name: string
}

export interface StateDto {
  id: string
  name: string
  uf: string
}

export interface CityDto {
  id: string
  name: string
  stateId: string
}

export interface IbgeResolveDto {
  state: StateDto | null
  city: CityDto | null
}

export interface PetImageDto {
  id: string
  url: string
  position: number
}

/** A vaccine the pet has received, summarized for display (catalog id + name). */
export interface PetVaccineDto {
  id: string
  name: string
}

export interface PetDto {
  id: string
  name: string | null
  speciesId: string
  breedId: string | null
  description: string | null
  weight: string | null
  size: 'small' | 'medium' | 'large' | null
  coat: string | null
  sex: 'male' | 'female' | 'unknown'
  specialNeeds: string | null
  neutered: boolean
  active: boolean
  birthDate: string | null
  status: 'available' | 'pending' | 'adopted'
  publishedAt: string | null
  adoptedAt: string | null
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
  species: { id: string; name: string } | null
  breed: { id: string; name: string } | null
  creator?: AuditUserDto | null
  updater?: AuditUserDto | null
  images: PetImageDto[]
  vaccines?: PetVaccineDto[]
}

/** Aggregate counts for the admin pets dashboard cards. */
export interface PetStatsDto {
  available: number
  adopted: number
  neutered: number
}

/** Audit fields present on all catalog rows (created/updated by + timestamps). */
export interface AuditFieldsDto {
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
  creator?: AuditUserDto | null
  updater?: AuditUserDto | null
}

export interface SpeciesDto extends AuditFieldsDto {
  id: string
  name: string
}

export interface BreedDto extends AuditFieldsDto {
  id: string
  speciesId: string
  name: string
}

export interface VaccineDto extends AuditFieldsDto {
  id: string
  name: string
  description: string | null
  expirationDate: string | null
}

export interface AppliedVaccineDto {
  id: string
  petId: string
  vaccineId: string
  vetLicense: string | null
  batchNumber: string | null
  applicationDate: string
  nextDoseDate: string | null
}

export interface AdoptionApplicationDto {
  id: string
  petId: string
  adopterUserId: string
  document: string | null
  contactPhone: string | null
  message: string | null
  age: number
  home: 'house' | 'apartment'
  cityId: string
  street: string | null
  number: string | null
  neighborhood: string | null
  complement: string | null
  zipCode: string | null
  isRental: boolean
  allowPets: boolean | null
  firstPet: boolean
  hasFinancialConditions: boolean
  enclosureType: ('walled' | 'fenced' | 'fully_enclosed' | 'is_netted')[] | null
  acceptedTerms: boolean
  status: 'pending' | 'approved' | 'rejected' | 'canceled'
  reviewedAt: string | null
  rejectReason: string | null
  rejectedAt: string | null
  canceledAt: string | null
  createdAt: string
  city: {
    id: string
    name: string
    state: { id: string; name: string; uf: string } | null
  } | null
  pet: {
    id: string
    name: string
    status: string
    description?: string | null
    size?: 'small' | 'medium' | 'large' | null
    birthDate?: string | null
    images?: PetImageDto[]
    vaccines?: PetVaccineDto[]
  } | null
  adopter: { id: string; name: string; email: string } | null
}

/** Aggregate counts for the admin adoption-applications dashboard cards. */
export interface AdoptionApplicationStatsDto {
  total: number
  pending: number
  approved: number
  rejected: number
}

/** Admin dashboard analytics: KPI cards + pets registered/adopted per month. */
export interface AdminAnalyticsDto {
  cards: {
    adopted: number
    available: number
    pendingApplications: number
    vaccinated: number
  }
  petsPerMonth: { month: string; created: number; adopted: number }[]
}

export interface InvitationDto {
  id: string
  email: string
  role: 'admin' | 'staff'
  acceptedAt: string | null
  expiresAt: string
  createdAt: string
}

/** A platform user (adopter or staff), listed in the admin users table. */
export interface UserDto {
  id: string
  name: string
  email: string
  role: 'admin' | 'staff' | 'adopter'
  image: string | null
  emailVerified: boolean
  banned: boolean | null
  createdAt: string
  updatedAt: string
}

/** The current staff member's editable profile. */
export interface ProfileDto {
  /** staff_profile id */
  id: string
  /** Display name — kept in sync with the BetterAuth user.name. */
  name: string
  phone: string | null
}

/** The current staff member's contact address. */
export interface AddressDto {
  id: string
  cityId: string
  /** The city's state, so the form can preselect the state and scope cities. */
  stateId: string
  street: string
  number: string | null
  neighborhood: string | null
  complement: string | null
  zipCode: string | null
}
