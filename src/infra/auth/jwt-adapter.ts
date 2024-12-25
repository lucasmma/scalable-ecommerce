import jwt from 'jsonwebtoken';
import { JwtProtocol } from '../../data/protocols/jwt'
import { Prisma, User } from '@prisma/client'

export class JwtAdapter implements JwtProtocol {
  private readonly secret: string

  constructor (newSecret: string) {
    this.secret = newSecret
  }

  encode(user: Omit<User, 'password'>, expiresIn: '8h' | '7d') : string {
    return jwt.sign(user, this.secret, { expiresIn: expiresIn})
  }
  
  validate (token: string): Omit<User, 'password'> {
    return jwt.verify(token, this.secret) as Omit<User, 'password'>
  }
}
