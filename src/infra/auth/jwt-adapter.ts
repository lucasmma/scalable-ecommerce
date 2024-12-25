import jwt from 'jsonwebtoken';
import { JwtProtocol } from '../../data/protocols/jwt'
import { Prisma } from '@prisma/client'

export class JwtAdapter implements JwtProtocol {
  private readonly secret: string

  constructor (newSecret: string) {
    this.secret = newSecret
  }

  encode(user: Omit<Prisma.UserFieldRefs, 'password'>) : string {
    return jwt.sign(user, this.secret, { expiresIn: '8h'})
  }
  
  validate (token: string): Omit<Prisma.UserFieldRefs, 'password'> {
    return jwt.verify(token, this.secret) as Omit<Prisma.UserFieldRefs, 'password'>
  }
}
