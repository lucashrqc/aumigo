import type {
  AppliedVaccineRepository,
  VaccineRepository,
  VaccineRow,
} from '../repositories/vaccine.repository'
import type {
  AppliedVaccineCreateInput,
  VaccineCreateInput,
  VaccineListQuery,
  VaccineUpdateInput,
} from '#shared/schemas'

export class VaccineService {
  constructor(
    private readonly vaccines: VaccineRepository,
    private readonly appliedVaccines: AppliedVaccineRepository,
  ) {}

  list(query: VaccineListQuery) {
    return this.vaccines.list(query)
  }

  async getById(id: string): Promise<VaccineRow> {
    const vaccine = await this.vaccines.findById(id)
    if (!vaccine) throw createError({ statusCode: 404, statusMessage: 'Vacina não encontrada' })
    return vaccine
  }

  create(input: VaccineCreateInput, actorId: string) {
    return this.vaccines.create(input, actorId)
  }

  async update(id: string, input: VaccineUpdateInput, actorId: string) {
    const updated = await this.vaccines.update(id, input, actorId)
    if (!updated) throw createError({ statusCode: 404, statusMessage: 'Vacina não encontrada' })
    return updated
  }

  async remove(id: string, actorId: string): Promise<void> {
    await this.getById(id)
    await this.vaccines.softDelete(id, actorId)
  }

  listAppliedForPet(petId: string) {
    return this.appliedVaccines.listByPet(petId)
  }

  async applyToPet(input: AppliedVaccineCreateInput, actorId: string) {
    const vaccine = await this.vaccines.findById(input.vaccineId)
    if (!vaccine) throw createError({ statusCode: 422, statusMessage: 'Vacina desconhecida' })
    return this.appliedVaccines.create(input, actorId)
  }

  removeApplied(id: string) {
    return this.appliedVaccines.delete(id)
  }
}
