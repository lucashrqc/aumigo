import type {
  AdoptionApplicationRepository,
  AdoptionApplicationWithRelations,
} from '../repositories/adoption.repository'
import type { PetRepository } from '../repositories/pet.repository'
import type {
  AdoptionApplicationCreateInput,
  AdoptionApplicationListQuery,
  AdoptionApplicationReviewInput,
} from '#shared/schemas'

export class AdoptionService {
  constructor(
    private readonly applications: AdoptionApplicationRepository,
    private readonly pets: PetRepository,
  ) {}

  list(query: AdoptionApplicationListQuery) {
    return this.applications.list(query)
  }

  listForAdopter(adopterUserId: string) {
    return this.applications.listByAdopter(adopterUserId)
  }

  /** Adopter submits an application for a pet. */
  async apply(input: AdoptionApplicationCreateInput, adopterUserId: string) {
    const pet = await this.pets.findById(input.petId)
    if (!pet || !pet.active) {
      throw createError({ statusCode: 404, statusMessage: 'Pet not found' })
    }
    if (pet.status === 'adopted') {
      throw createError({ statusCode: 409, statusMessage: 'This pet has already been adopted' })
    }

    const existing = await this.applications.findOpenByPetAndAdopter(input.petId, adopterUserId)
    if (existing) {
      throw createError({
        statusCode: 409,
        statusMessage: 'You already have an open application for this pet',
      })
    }

    return this.applications.create({
      petId: input.petId,
      adopterUserId,
      contactPhone: input.contactPhone,
      message: input.message,
    })
  }

  /** Staff approve or reject an application. */
  async review(
    applicationId: string,
    input: AdoptionApplicationReviewInput,
    reviewerId: string,
  ): Promise<AdoptionApplicationWithRelations> {
    const application = await this.applications.findById(applicationId)
    if (!application) {
      throw createError({ statusCode: 404, statusMessage: 'Application not found' })
    }
    if (application.status !== 'pending') {
      throw createError({ statusCode: 409, statusMessage: 'Application already reviewed' })
    }

    if (input.decision === 'approved') {
      if (application.pet?.status === 'adopted') {
        throw createError({ statusCode: 409, statusMessage: 'Pet has already been adopted' })
      }
      await this.applications.approve(applicationId, application.petId, reviewerId)
    } else {
      await this.applications.reject(applicationId, reviewerId)
    }

    return (await this.applications.findById(applicationId))!
  }
}
