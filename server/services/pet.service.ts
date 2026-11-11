import type { ImageStorage } from '../storage/image-storage'
import type {
  PetListOptions,
  PetRepository,
  PetWithRelations,
} from '../repositories/pet.repository'
import type { AdoptionApplicationRepository } from '../repositories/adoption.repository'
import type { VaccineRepository } from '../repositories/vaccine.repository'
import type { PetCreateInput, PetListQuery, PetUpdateInput, Paginated } from '#shared/schemas'
import type { PetStatsDto } from '#shared/types'

export class PetService {
  constructor(
    private readonly pets: PetRepository,
    private readonly images: ImageStorage,
    private readonly applications: AdoptionApplicationRepository,
    private readonly vaccines: VaccineRepository,
  ) {}

  list(query: PetListQuery, options?: PetListOptions): Promise<Paginated<PetWithRelations>> {
    return this.pets.list(query, options)
  }

  stats(): Promise<PetStatsDto> {
    return this.pets.stats()
  }

  async getById(id: string): Promise<PetWithRelations> {
    const pet = await this.pets.findById(id)
    if (!pet) throw createError({ statusCode: 404, statusMessage: 'Pet não encontrado' })
    return pet
  }

  async create(input: PetCreateInput, actorId: string): Promise<PetWithRelations> {
    await this.ensureVaccinesExist(input.appliedVaccines)
    const data = {
      ...input,
      status: 'pending' as const,
      images: await this.normalizeImages(input.images),
    }
    return this.pets.create(data, actorId)
  }

  async update(id: string, input: PetUpdateInput, actorId: string): Promise<PetWithRelations> {
    await this.getById(id)
    const data =
      input.images !== undefined
        ? { ...input, images: await this.normalizeImages(input.images) }
        : input
    const updated = await this.pets.update(id, data, actorId)
    if (!updated) throw createError({ statusCode: 404, statusMessage: 'Pet não encontrado' })
    return updated
  }

  async remove(id: string, actorId: string): Promise<void> {
    await this.getById(id)
    await this.pets.softDelete(id, actorId)
  }

  /** Publish a pending pet so it shows on the public site. */
  async publish(id: string, actorId: string): Promise<PetWithRelations> {
    const pet = await this.getById(id)
    if (pet.status !== 'pending') {
      throw createError({ statusCode: 409, statusMessage: 'Apenas pets pendentes podem ser publicados' })
    }
    await this.pets.publish(id, actorId)
    return this.getById(id)
  }

  /**
   * Take a pet off the public site. An adopted pet goes back to pending and its
   * applications are re-opened; an available pet simply returns to pending.
   */
  async unpublish(id: string, actorId: string): Promise<PetWithRelations> {
    const pet = await this.getById(id)
    if (pet.status === 'adopted') {
      await this.applications.revertPetAdoption(id, actorId)
    } else {
      await this.pets.unpublish(id, actorId)
    }
    return this.getById(id)
  }

  /** Mark an available pet as adopted and auto-reject its open applications. */
  async markAdopted(id: string, actorId: string): Promise<PetWithRelations> {
    const pet = await this.getById(id)
    if (pet.status !== 'available') {
      throw createError({ statusCode: 409, statusMessage: 'Apenas pets disponíveis podem ser marcados como adotados' })
    }
    await this.applications.markPetAdopted(id, actorId)
    return this.getById(id)
  }

  private async ensureVaccinesExist(
    applied: PetCreateInput['appliedVaccines'],
  ) {
    for (const { vaccineId } of applied) {
      const vaccine = await this.vaccines.findById(vaccineId)
      if (!vaccine) throw createError({ statusCode: 422, statusMessage: 'Vacina desconhecida' })
    }
  }

  private async normalizeImages(images: PetCreateInput['images']) {
    return Promise.all(
      images.map(async (img) => ({
        ...img,
        url: await this.images.resolveUrl({ url: img.url }),
      })),
    )
  }
}
