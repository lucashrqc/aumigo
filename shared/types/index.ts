/** Response DTOs shared between the Nuxt server and client. */

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

export interface PetDto {
  id: string
  name: string
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
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
  species: { id: string; name: string } | null
  breed: { id: string; name: string } | null
  creator?: AuditUserDto | null
  updater?: AuditUserDto | null
  images: PetImageDto[]
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
  contactPhone: string | null
  message: string | null
  status: 'pending' | 'approved' | 'rejected'
  reviewedAt: string | null
  createdAt: string
  pet: { id: string; name: string; status: string } | null
  adopter: { id: string; name: string; email: string } | null
}

/** Aggregate counts for the admin adoption-applications dashboard cards. */
export interface AdoptionApplicationStatsDto {
  total: number
  pending: number
  approved: number
  rejected: number
}

export interface InvitationDto {
  id: string
  email: string
  role: 'admin' | 'staff'
  acceptedAt: string | null
  expiresAt: string
  createdAt: string
}

/** The current staff member's editable profile. */
export interface ProfileDto {
  /** staff_profile id */
  id: string
  /** Display name — kept in sync with the BetterAuth user.name. */
  name: string
  phone: string | null
}
