import { pgEnum } from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_role', ['admin', 'staff', 'adopter'])
export const petSexEnum = pgEnum('pet_sex', ['male', 'female', 'unknown'])
export const petSizeEnum = pgEnum('pet_size', ['small', 'medium', 'large'])
export const petStatusEnum = pgEnum('pet_status', ['available', 'pending', 'adopted'])
export const applicationStatusEnum = pgEnum('application_status', [
  'pending',
  'approved',
  'rejected',
])
export const invitationRoleEnum = pgEnum('invitation_role', ['admin', 'staff'])
