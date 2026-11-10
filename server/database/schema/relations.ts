import { relations } from 'drizzle-orm'
import { user } from './auth'
import {
  address,
  adoptionApplication,
  appliedVaccine,
  breed,
  city,
  pet,
  petImage,
  species,
  staffProfile,
  state,
  vaccine,
} from './domain'

export const userRelations = relations(user, ({ one, many }) => ({
  staffProfile: one(staffProfile, {
    fields: [user.id],
    references: [staffProfile.userId],
  }),
  applications: many(adoptionApplication),
}))

export const staffProfileRelations = relations(staffProfile, ({ one, many }) => ({
  user: one(user, { fields: [staffProfile.userId], references: [user.id] }),
  addresses: many(address),
}))

export const stateRelations = relations(state, ({ many }) => ({
  cities: many(city),
}))

export const cityRelations = relations(city, ({ one, many }) => ({
  state: one(state, { fields: [city.stateId], references: [state.id] }),
  addresses: many(address),
}))

export const addressRelations = relations(address, ({ one }) => ({
  staff: one(staffProfile, { fields: [address.staffId], references: [staffProfile.id] }),
  city: one(city, { fields: [address.cityId], references: [city.id] }),
}))

export const speciesRelations = relations(species, ({ one, many }) => ({
  breeds: many(breed),
  pets: many(pet),
  creator: one(user, {
    fields: [species.createdBy],
    references: [user.id],
    relationName: 'speciesCreator',
  }),
  updater: one(user, {
    fields: [species.updatedBy],
    references: [user.id],
    relationName: 'speciesUpdater',
  }),
}))

export const breedRelations = relations(breed, ({ one, many }) => ({
  species: one(species, { fields: [breed.speciesId], references: [species.id] }),
  pets: many(pet),
  creator: one(user, {
    fields: [breed.createdBy],
    references: [user.id],
    relationName: 'breedCreator',
  }),
  updater: one(user, {
    fields: [breed.updatedBy],
    references: [user.id],
    relationName: 'breedUpdater',
  }),
}))

export const petRelations = relations(pet, ({ one, many }) => ({
  species: one(species, { fields: [pet.speciesId], references: [species.id] }),
  breed: one(breed, { fields: [pet.breedId], references: [breed.id] }),
  creator: one(user, {
    fields: [pet.createdBy],
    references: [user.id],
    relationName: 'petCreator',
  }),
  updater: one(user, {
    fields: [pet.updatedBy],
    references: [user.id],
    relationName: 'petUpdater',
  }),
  images: many(petImage),
  appliedVaccines: many(appliedVaccine),
  applications: many(adoptionApplication),
}))

export const petImageRelations = relations(petImage, ({ one }) => ({
  pet: one(pet, { fields: [petImage.petId], references: [pet.id] }),
}))

export const vaccineRelations = relations(vaccine, ({ one, many }) => ({
  appliedVaccines: many(appliedVaccine),
  creator: one(user, {
    fields: [vaccine.createdBy],
    references: [user.id],
    relationName: 'vaccineCreator',
  }),
  updater: one(user, {
    fields: [vaccine.updatedBy],
    references: [user.id],
    relationName: 'vaccineUpdater',
  }),
}))

export const appliedVaccineRelations = relations(appliedVaccine, ({ one }) => ({
  pet: one(pet, { fields: [appliedVaccine.petId], references: [pet.id] }),
  vaccine: one(vaccine, { fields: [appliedVaccine.vaccineId], references: [vaccine.id] }),
}))

export const adoptionApplicationRelations = relations(adoptionApplication, ({ one }) => ({
  pet: one(pet, { fields: [adoptionApplication.petId], references: [pet.id] }),
  adopter: one(user, {
    fields: [adoptionApplication.adopterUserId],
    references: [user.id],
  }),
  city: one(city, {
    fields: [adoptionApplication.cityId],
    references: [city.id],
  }),
}))
