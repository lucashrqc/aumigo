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

  stats() {
    return this.applications.stats()
  }

  listForAdopter(adopterUserId: string) {
    return this.applications.listByAdopter(adopterUserId)
  }

  /** Adopter submits an application for a pet. */
  async apply(input: AdoptionApplicationCreateInput, adopterUserId: string) {
    const pet = await this.pets.findById(input.petId)
    if (!pet || !pet.active) {
      throw createError({ statusCode: 404, statusMessage: 'Pet não encontrado' })
    }
    if (pet.status === 'adopted') {
      throw createError({ statusCode: 409, statusMessage: 'Este pet já foi adotado' })
    }

    const existing = await this.applications.findOpenByPetAndAdopter(input.petId, adopterUserId)
    if (existing) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Você já tem uma candidatura aberta para este pet',
      })
    }

    return this.applications.create({
      petId: input.petId,
      adopterUserId,
      document: input.document,
      contactPhone: input.contactPhone,
      message: input.message,
      age: input.age,
      home: input.home,
      cityId: input.cityId,
      street: input.street,
      number: input.number,
      neighborhood: input.neighborhood,
      complement: input.complement ?? null,
      zipCode: input.zipCode,
      isRental: input.isRental,
      allowPets: input.isRental ? (input.allowPets ?? null) : null,
      firstPet: input.firstPet,
      hasFinancialConditions: input.hasFinancialConditions,
      enclosureType: input.enclosureType?.length ? input.enclosureType : null,
      acceptedTerms: input.acceptedTerms,
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
      throw createError({ statusCode: 404, statusMessage: 'Candidatura não encontrada' })
    }
    if (application.status !== 'pending') {
      throw createError({ statusCode: 409, statusMessage: 'Candidatura já foi avaliada' })
    }

    if (input.decision === 'approved') {
      if (application.pet?.status === 'adopted') {
        throw createError({ statusCode: 409, statusMessage: 'Este pet já foi adotado' })
      }
      await this.applications.approve(applicationId, application.petId, reviewerId)
    } else {
      await this.applications.reject(
        applicationId,
        reviewerId,
        input.rejectReason ?? null,
      )
    }

    return (await this.applications.findById(applicationId))!
  }

  /** Staff cancel an application. A canceled approval frees the pet again. */
  async cancelApplication(
    applicationId: string,
    actorId: string,
  ): Promise<AdoptionApplicationWithRelations> {
    const application = await this.applications.findById(applicationId)
    if (!application) {
      throw createError({ statusCode: 404, statusMessage: 'Candidatura não encontrada' })
    }
    if (application.status === 'canceled') {
      throw createError({ statusCode: 409, statusMessage: 'Candidatura já foi cancelada' })
    }

    await this.applications.cancelApplication(applicationId, actorId)
    return (await this.applications.findById(applicationId))!
  }
}
