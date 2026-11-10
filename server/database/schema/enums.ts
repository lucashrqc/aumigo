import { pgEnum } from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_role', ['admin', 'staff', 'adopter'])
export const petSexEnum = pgEnum('pet_sex', ['male', 'female', 'unknown'])
export const petSizeEnum = pgEnum('pet_size', ['small', 'medium', 'large'])
export const petStatusEnum = pgEnum('pet_status', [
  'available',
  'pending',
  'adopted',
])
export const applicationStatusEnum = pgEnum('application_status', [
  'pending',
  'approved',
  'rejected',
  'canceled',
])
export const invitationRoleEnum = pgEnum('invitation_role', ['admin', 'staff'])
export const homeEnum = pgEnum('home', ['house', 'apartment'])
export const enclosureTypeEnum = pgEnum('enclosure_type', [
  'walled',
  'fenced',
  'fully_enclosed',
  'is_netted',
])
