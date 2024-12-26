import { BcryptAdapter } from '../../infra/criptography/bcrypt-adapter'
import { HttpRequest, HttpResponse } from '../protocols'
import { badRequest, ok } from '../helpers/http-helper'
import prisma from '../../main/config/prisma'
import env from '../../main/config/env'
import { JwtAdapter } from '../../infra/auth/jwt-adapter'
import { createUserSchema } from '../../main/schemas/user/create-user-schema'
import { oauthTokenSchema } from '../../main/schemas/user/oauth-token-schema'
import { omit } from '../helpers/omit-field'

export class UserController {
  constructor(private readonly bcrypt: BcryptAdapter,
     private readonly jwtAdapter: JwtAdapter,
     private readonly secondaryJwtAdapter: JwtAdapter) {
    this.bcrypt = bcrypt
    this.jwtAdapter = jwtAdapter
    this.secondaryJwtAdapter = secondaryJwtAdapter
  }
  async createUser(
    request: HttpRequest<( typeof createUserSchema._output)>,
  ): Promise<HttpResponse> {
    const body = request.body!

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

    const bodyWithoutPassword = omit(body, ['password', 'passwordConfirmation'])
    // reomve password from body

    const user = await prisma.user.create({
      data: {
        ...bodyWithoutPassword,
        role: 'USER',
        password: hashedPassword,
      }
    })

    // TODO: implement jwt management

    const userWithoutPassword = omit(user, ['password'])

    var token = this.jwtAdapter.encode(userWithoutPassword, '8h')
    var refreshToken = this.secondaryJwtAdapter.encode(userWithoutPassword, '7d')

    return ok({
      ...userWithoutPassword,
      token,
      refreshToken
    })
  }
}