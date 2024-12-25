import jwt from 'jsonwebtoken';
import { JwtProtocol } from '../../data/protocols/jwt'
import { Prisma, User } from '@prisma/client'

export class JwtAdapter implements JwtProtocol {
  private readonly secret: string

  constructor (newSecret: string) {
    this.secret = newSecret
  }

  encode(user: Omit<User, 'password'>) : string {
    return jwt.sign(user, this.secret, { expiresIn: '8h'})
  }
  
  validate (token: string): Omit<User, 'password'> {
    return jwt.verify(token, this.secret) as Omit<User, 'password'>
  }
}
