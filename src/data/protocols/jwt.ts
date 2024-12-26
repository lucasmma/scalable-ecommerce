import { User } from '@prisma/client'

export interface JwtProtocol {
  encode: (user: Omit<User, 'password'>, expiresIn: '8h' | '7d') => string
  validate: (token: string) => Omit<User, 'password'>
  decode: (token: string) => Omit<User, 'password'>
}