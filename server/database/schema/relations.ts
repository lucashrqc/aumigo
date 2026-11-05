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

export const cityRelations = relations(city, ({ many }) => ({
  addresses: many(address),
}))

export const addressRelations = relations(address, ({ one }) => ({
  staff: one(staffProfile, { fields: [address.staffId], references: [staffProfile.id] }),
  city: one(city, { fields: [address.cityId], references: [city.id] }),
}))

export const speciesRelations = relations(species, ({ many }) => ({
  breeds: many(breed),
  pets: many(pet),
}))

export const breedRelations = relations(breed, ({ one, many }) => ({
  species: one(species, { fields: [breed.speciesId], references: [species.id] }),
  pets: many(pet),
}))

export const petRelations = relations(pet, ({ one, many }) => ({
  species: one(species, { fields: [pet.speciesId], references: [species.id] }),
  breed: one(breed, { fields: [pet.breedId], references: [breed.id] }),
  images: many(petImage),
  appliedVaccines: many(appliedVaccine),
  applications: many(adoptionApplication),
}))

export const petImageRelations = relations(petImage, ({ one }) => ({
  pet: one(pet, { fields: [petImage.petId], references: [pet.id] }),
}))

export const vaccineRelations = relations(vaccine, ({ many }) => ({
  appliedVaccines: many(appliedVaccine),
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
}))
