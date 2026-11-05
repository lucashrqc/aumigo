/** Response DTOs shared between the Nuxt server and client. */

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
  species: { id: string; name: string } | null
  breed: { id: string; name: string } | null
  images: PetImageDto[]
}

export interface SpeciesDto {
  id: string
  name: string
}

export interface BreedDto {
  id: string
  speciesId: string
  name: string
}

export interface VaccineDto {
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

export interface InvitationDto {
  id: string
  email: string
  role: 'admin' | 'staff'
  acceptedAt: string | null
  expiresAt: string
  createdAt: string
}
