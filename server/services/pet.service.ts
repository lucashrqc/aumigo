import type { ImageStorage } from '../storage/image-storage'
import type { PetRepository, PetWithRelations } from '../repositories/pet.repository'
import type { PetCreateInput, PetListQuery, PetUpdateInput, Paginated } from '#shared/schemas'

export class PetService {
  constructor(
    private readonly pets: PetRepository,
    private readonly images: ImageStorage,
  ) {}

  list(query: PetListQuery): Promise<Paginated<PetWithRelations>> {
    return this.pets.list(query)
  }

  async getById(id: string): Promise<PetWithRelations> {
    const pet = await this.pets.findById(id)
    if (!pet) throw createError({ statusCode: 404, statusMessage: 'Pet not found' })
    return pet
  }

  async create(input: PetCreateInput, actorId: string): Promise<PetWithRelations> {
    const data = { ...input, images: await this.normalizeImages(input.images) }
    return this.pets.create(data, actorId)
  }

  async update(id: string, input: PetUpdateInput, actorId: string): Promise<PetWithRelations> {
    await this.getById(id)
    const data =
      input.images !== undefined
        ? { ...input, images: await this.normalizeImages(input.images) }
        : input
    const updated = await this.pets.update(id, data, actorId)
    if (!updated) throw createError({ statusCode: 404, statusMessage: 'Pet not found' })
    return updated
  }

  async remove(id: string, actorId: string): Promise<void> {
    await this.getById(id)
    await this.pets.softDelete(id, actorId)
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
