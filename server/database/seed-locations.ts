import 'dotenv/config'
import { eq } from 'drizzle-orm'
import { createDatabase } from './client'
import { city, state } from './schema'

const IBGE_BASE = 'https://servicodados.ibge.gov.br/api/v1/localidades'
const CITY_INSERT_CHUNK = 500

interface IbgeState {
  id: number
  sigla: string
  nome: string
}

interface IbgeCity {
  id: number
  nome: string
  microrregiao: { mesorregiao: { UF: { id: number } } }
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`IBGE request failed: ${res.status} ${res.statusText} (${url})`)
  return (await res.json()) as T
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

async function seedStates(db: ReturnType<typeof createDatabase>) {
  const apiStates = await fetchJson<IbgeState[]>(`${IBGE_BASE}/estados?orderBy=nome`)

  const existing = await db
    .select({ id: state.id, ibgeId: state.ibgeId, name: state.name, uf: state.uf })
    .from(state)
  const byIbgeId = new Map(existing.map((s) => [s.ibgeId, s]))

  const stateIdByIbgeId = new Map<number, string>()
  let created = 0
  let updated = 0

  for (const s of apiStates) {
    const current = byIbgeId.get(s.id)
    if (!current) {
      const [row] = await db
        .insert(state)
        .values({ ibgeId: s.id, name: s.nome, uf: s.sigla })
        .returning({ id: state.id })
      stateIdByIbgeId.set(s.id, row!.id)
      created++
    } else {
      stateIdByIbgeId.set(s.id, current.id)
      if (current.name !== s.nome || current.uf !== s.sigla) {
        await db
          .update(state)
          .set({ name: s.nome, uf: s.sigla, updatedAt: new Date() })
          .where(eq(state.id, current.id))
        updated++
      }
    }
  }

  console.log(`States: ${created} created, ${updated} updated`)
  return stateIdByIbgeId
}

async function seedCities(
  db: ReturnType<typeof createDatabase>,
  stateIdByIbgeId: Map<number, string>,
) {
  const apiCities = await fetchJson<IbgeCity[]>(`${IBGE_BASE}/municipios?orderBy=nome`)

  const existing = await db
    .select({ id: city.id, ibgeId: city.ibgeId, name: city.name, stateId: city.stateId })
    .from(city)
  const byIbgeId = new Map(existing.filter((c) => c.ibgeId !== null).map((c) => [c.ibgeId!, c]))

  let created = 0
  let updated = 0
  const toInsert: { ibgeId: number; name: string; stateId: string }[] = []

  for (const c of apiCities) {
    const stateIbgeId = c.microrregiao?.mesorregiao?.UF?.id
    const stateId = stateIbgeId ? stateIdByIbgeId.get(stateIbgeId) : undefined
    if (!stateId) {
      console.warn(`Skipping city ${c.nome} (${c.id}): unresolved UF ${stateIbgeId}`)
      continue
    }

    const current = byIbgeId.get(c.id)
    if (!current) {
      toInsert.push({ ibgeId: c.id, name: c.nome, stateId })
    } else if (current.name !== c.nome || current.stateId !== stateId) {
      await db
        .update(city)
        .set({ name: c.nome, stateId, updatedAt: new Date() })
        .where(eq(city.id, current.id))
      updated++
    }
  }

  for (const batch of chunk(toInsert, CITY_INSERT_CHUNK)) {
    await db.insert(city).values(batch)
    created += batch.length
  }

  console.log(`Cities: ${created} created, ${updated} updated`)
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) throw new Error('DATABASE_URL is not set')

  const db = createDatabase(databaseUrl)

  let stateIdByIbgeId: Map<number, string>
  try {
    stateIdByIbgeId = await seedStates(db)
  } catch (err) {
    console.error('State seed failed, aborting city seed:', err)
    process.exit(1)
  }

  await seedCities(db, stateIdByIbgeId)

  console.log('Location seed complete.')
  process.exit(0)
}

main().catch((err) => {
  console.error('Location seed failed:', err)
  process.exit(1)
})
