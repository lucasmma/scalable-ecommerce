import { User } from '@prisma/client'

export interface JwtProtocol {
  encode: (user: Omit<User, 'password'>) => string
  validate: (token: string) => Omit<User, 'password'>
}