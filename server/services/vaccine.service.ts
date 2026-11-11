import type {
  AppliedVaccineRepository,
  VaccineRepository,
  VaccineRow,
} from '../repositories/vaccine.repository'
import type {
  AppliedVaccineCreateInput,
  AppliedVaccineUpdateInput,
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
    await this.ensureVaccineExists(input.vaccineId)
    return this.appliedVaccines.create(input, actorId)
  }

  async updateApplied(
    id: string,
    input: AppliedVaccineUpdateInput,
    actorId: string,
  ) {
    if (input.vaccineId) await this.ensureVaccineExists(input.vaccineId)
    const updated = await this.appliedVaccines.update(id, input, actorId)
    if (!updated) throw createError({ statusCode: 404, statusMessage: 'Registro de vacina não encontrado' })
    return updated
  }

  async removeApplied(id: string): Promise<void> {
    const applied = await this.appliedVaccines.findById(id)
    if (!applied) throw createError({ statusCode: 404, statusMessage: 'Registro de vacina não encontrado' })
    await this.appliedVaccines.delete(id)
  }

  private async ensureVaccineExists(vaccineId: string) {
    const vaccine = await this.vaccines.findById(vaccineId)
    if (!vaccine) throw createError({ statusCode: 422, statusMessage: 'Vacina desconhecida' })
  }
}
