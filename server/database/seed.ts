import 'dotenv/config'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin as adminPlugin } from 'better-auth/plugins'
import { eq } from 'drizzle-orm'
import { createDatabase } from './client'
import { account, session, species, staffProfile, user, verification } from './schema'

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) throw new Error('DATABASE_URL is not set')

  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@aumor.local'
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!'
  const name = process.env.SEED_ADMIN_NAME ?? 'Aumor Admin'

  const db = createDatabase(databaseUrl)

  const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
    secret: process.env.BETTER_AUTH_SECRET ?? 'seed-secret',
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: { user, session, account, verification },
    }),
    emailAndPassword: { enabled: true, minPasswordLength: 8 },
    plugins: [adminPlugin({ adminRoles: ['admin'], defaultRole: 'adopter' })],
  })

  // --- First admin (idempotent) ---
  const existing = await db.query.user.findFirst({ where: eq(user.email, email) })
  if (existing) {
    console.log(`Admin ${email} already exists, skipping.`)
  } else {
    const result = await auth.api.signUpEmail({ body: { email, password, name } })
    const userId = result.user.id
    await db.update(user).set({ role: 'admin', emailVerified: true }).where(eq(user.id, userId))
    await db.insert(staffProfile).values({ userId, name }).onConflictDoNothing()
    console.log(`Created admin ${email}`)
  }

  // --- Reference species (idempotent) ---
  for (const speciesName of ['Cachorro', 'Gato']) {
    await db.insert(species).values({ name: speciesName }).onConflictDoNothing()
  }

  console.log('Seed complete.')
  process.exit(0)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
