import { BcryptAdapter } from '../../infra/criptography/bcrypt-adapter'
import { HttpRequest, HttpResponse } from '../protocols'
import { badRequest, ok } from '../helpers/http-helper'
import prisma from '../../main/config/prisma'
import env from '../../main/config/env'
import { JwtAdapter } from '../../infra/auth/jwt-adapter'

export class UserController {
  constructor(private readonly bcrypt: BcryptAdapter,
     private readonly jwtAdapter: JwtAdapter,
     private readonly secondaryJwtAdapter: JwtAdapter) {
    this.bcrypt = bcrypt
    this.jwtAdapter = jwtAdapter
    this.secondaryJwtAdapter = secondaryJwtAdapter
  }

  async createUser(
    request: HttpRequest,
  ): Promise<HttpResponse> {
    const { body } = request


    // check if confirmation password is equal to password
    if (body.password !== body.confirmationPassword) {
      return badRequest(new Error('Passwords do not match'))
    }

    // check if email is valid
    

    // check duplicates in database
    var existentUser = await prisma.user.findUnique({
      where: {
        email: body.email,
      }
    })

    if (existentUser) {
      return badRequest(new Error('User already exists'))
    }

    const hashedPassword = await this.bcrypt.encrypt(body.password)

    delete body.confirmationPassword; delete body.password

    const user = await prisma.user.create({
      data: {
        ...body,
        role: 'USER',
        password: hashedPassword,
      }
    })

    // TODO: implement jwt management

    const {
      password,
      ...userWithoutPassword
    } = user

    var token = this.jwtAdapter.encode(userWithoutPassword, '8h')
    var refreshToken = this.secondaryJwtAdapter.encode(userWithoutPassword, '7d')

    return ok({
      ...user,
      token,
      refreshToken
    })
  }
}