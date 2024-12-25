import { Prisma } from '@prisma/client'

export interface JwtProtocol {
  encode: (user: Omit<Prisma.UserFieldRefs, 'password'>) => string
  validate: (token: string) => Omit<Prisma.UserFieldRefs, 'password'>
}