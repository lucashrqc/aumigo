import { sql } from 'drizzle-orm'
import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { user } from './auth'
import { auditColumns, primaryId, timestamps } from './columns'
import {
  applicationStatusEnum,
  invitationRoleEnum,
  petSexEnum,
  petSizeEnum,
  petStatusEnum,
} from './enums'

/** Staff member profile (UML: Funcionario), 1:1 with a BetterAuth user. */
export const staffProfile = pgTable('staff_profile', {
  id: primaryId(),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  phone: text('phone'),
  active: boolean('active').notNull().default(true),
  ...timestamps,
})

/** City (UML: Cidade). */
export const city = pgTable('city', {
  id: primaryId(),
  name: text('name').notNull(),
  state: text('state').notNull(),
  ibgeCode: text('ibge_code'),
  ...timestamps,
})

/** Address (UML: Endereco) — belongs to a staff member and a city. */
export const address = pgTable(
  'address',
  {
    id: primaryId(),
    staffId: uuid('staff_id')
      .notNull()
      .references(() => staffProfile.id, { onDelete: 'cascade' }),
    cityId: uuid('city_id')
      .notNull()
      .references(() => city.id, { onDelete: 'restrict' }),
    street: text('street').notNull(),
    zipCode: text('zip_code'),
    neighborhood: text('neighborhood'),
    number: text('number'),
    complement: text('complement'),
    ...timestamps,
  },
  (t) => [index('address_staff_id_idx').on(t.staffId), index('address_city_id_idx').on(t.cityId)],
)

/** Species (UML: especie). */
export const species = pgTable('species', {
  id: primaryId(),
  name: text('name').notNull().unique(),
  ...timestamps,
  ...auditColumns,
})

/** Breed (UML: raca) — belongs to a species. */
export const breed = pgTable(
  'breed',
  {
    id: primaryId(),
    speciesId: uuid('species_id')
      .notNull()
      .references(() => species.id, { onDelete: 'restrict' }),
    name: text('name').notNull(),
    ...timestamps,
    ...auditColumns,
  },
  (t) => [
    index('breed_species_id_idx').on(t.speciesId),
    uniqueIndex('breed_species_name_uq').on(t.speciesId, t.name),
  ],
)

/** Pet. Status stays 'available' until staff approve an application. */
export const pet = pgTable(
  'pet',
  {
    id: primaryId(),
    name: text('name').notNull(),
    speciesId: uuid('species_id')
      .notNull()
      .references(() => species.id, { onDelete: 'restrict' }),
    breedId: uuid('breed_id').references(() => breed.id, { onDelete: 'set null' }),
    description: text('description'),
    weight: numeric('weight', { precision: 6, scale: 2 }),
    size: petSizeEnum('size'),
    coat: text('coat'),
    sex: petSexEnum('sex').notNull().default('unknown'),
    specialNeeds: text('special_needs'),
    neutered: boolean('neutered').notNull().default(false),
    active: boolean('active').notNull().default(true),
    birthDate: date('birth_date'),
    status: petStatusEnum('status').notNull().default('available'),
    ...timestamps,
    ...auditColumns,
  },
  (t) => [
    index('pet_species_id_idx').on(t.speciesId),
    index('pet_breed_id_idx').on(t.breedId),
    index('pet_status_idx').on(t.status),
    index('pet_active_idx').on(t.active),
  ],
)

/** Pet photos — multiple per pet, URL-only in v1 (behind the ImageStorage port). */
export const petImage = pgTable(
  'pet_image',
  {
    id: primaryId(),
    petId: uuid('pet_id')
      .notNull()
      .references(() => pet.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    position: integer('position').notNull().default(0),
    ...timestamps,
  },
  (t) => [index('pet_image_pet_id_idx').on(t.petId)],
)

/** Vaccine catalog (UML: Vacina). */
export const vaccine = pgTable(
  'vaccine',
  {
    id: primaryId(),
    name: text('name').notNull(),
    description: text('description'),
    expirationDate: date('expiration_date'),
    active: boolean('active').notNull().default(true),
    ...timestamps,
    ...auditColumns,
  },
  (t) => [index('vaccine_active_idx').on(t.active)],
)

/** Applied vaccine (UML: VacinaAplicada) — pet <-> vaccine with extra data. */
export const appliedVaccine = pgTable(
  'applied_vaccine',
  {
    id: primaryId(),
    petId: uuid('pet_id')
      .notNull()
      .references(() => pet.id, { onDelete: 'cascade' }),
    vaccineId: uuid('vaccine_id')
      .notNull()
      .references(() => vaccine.id, { onDelete: 'restrict' }),
    vetLicense: text('vet_license'),
    batchNumber: text('batch_number'),
    applicationDate: date('application_date').notNull(),
    nextDoseDate: date('next_dose_date'),
    ...timestamps,
    ...auditColumns,
  },
  (t) => [
    index('applied_vaccine_pet_id_idx').on(t.petId),
    index('applied_vaccine_vaccine_id_idx').on(t.vaccineId),
  ],
)

/** Adoption application — adopter applies, staff review. */
export const adoptionApplication = pgTable(
  'adoption_application',
  {
    id: primaryId(),
    petId: uuid('pet_id')
      .notNull()
      .references(() => pet.id, { onDelete: 'cascade' }),
    adopterUserId: text('adopter_user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    contactPhone: text('contact_phone'),
    message: text('message'),
    status: applicationStatusEnum('status').notNull().default('pending'),
    reviewedBy: text('reviewed_by').references(() => user.id, { onDelete: 'set null' }),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    ...timestamps,
    ...auditColumns,
  },
  (t) => [
    index('adoption_application_pet_id_idx').on(t.petId),
    index('adoption_application_adopter_idx').on(t.adopterUserId),
    index('adoption_application_status_idx').on(t.status),
    // An adopter may have at most one open (pending) application per pet.
    uniqueIndex('adoption_application_open_uq')
      .on(t.petId, t.adopterUserId)
      .where(sql`${t.status} = 'pending'`),
  ],
)

/** Staff invitation — admin invites an employee by email. */
export const staffInvitation = pgTable(
  'staff_invitation',
  {
    id: primaryId(),
    email: text('email').notNull(),
    role: invitationRoleEnum('role').notNull().default('staff'),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    acceptedAt: timestamp('accepted_at', { withTimezone: true }),
    invitedBy: text('invited_by').references(() => user.id, { onDelete: 'set null' }),
    ...timestamps,
  },
  (t) => [index('staff_invitation_email_idx').on(t.email)],
)
