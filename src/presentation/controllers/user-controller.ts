import { BcryptAdapter } from '../../infra/criptography/bcrypt-adapter'
import { HttpRequest, HttpResponse } from '../protocols'
import { badRequest, ok } from '../helpers/http-helper'
import prisma from '../../main/config/prisma'
import env from '../../main/config/env'
import { JwtAdapter } from '../../infra/auth/jwt-adapter'
import { createUserSchema } from '../../main/schemas/user/create-user-schema'
import { oauthTokenSchema } from '../../main/schemas/user/oauth-token-schema'
import { omit } from '../helpers/omit-field'
import { editUserSchema } from '../../main/schemas/user/edit-user-schema'
import { securityEventCounter } from '../../main/config/registry-metrics'

export class UserController {
  constructor(private readonly bcrypt: BcryptAdapter,
     readonly jwtAdapter: JwtAdapter,
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

  async oauthToken(
    request: HttpRequest<(typeof oauthTokenSchema._output)>,
  ): Promise<HttpResponse> {
    const body = request.body!

    if(body.grantType === 'client_credentials') {
      // check if client exists
      var user = await prisma.user.findUnique({
        where: {
          email: body.email,
        }
      })

      if (!user) {
        securityEventCounter.inc({ event_type: 'invalid_credentials', route: '/oauth/token' })
        return badRequest(new Error('Invalid credentials'))
      }

      const passwordMatch = await this.bcrypt.compare(body.password!, user.password)

      if (!passwordMatch) {
        securityEventCounter.inc({ event_type: 'invalid_credentials', route: '/oauth/token' })
        return badRequest(new Error('Invalid credentials'))
      }
      const userWithoutPassword = omit(user, ['password'])

      var token = this.jwtAdapter.encode(userWithoutPassword, '8h')
      var refreshToken = this.secondaryJwtAdapter.encode(userWithoutPassword, '7d')

      return ok({
        ...omit(userWithoutPassword, ['role']),
        token,
        refreshToken
      })
    } else {
      // check if refresh token is valid
      var isValid = this.secondaryJwtAdapter.validate(body.refreshToken!)

      if (!isValid) {
        securityEventCounter.inc({ event_type: 'invalid_refresh_token', route: '/oauth/token' })
        return badRequest(new Error('Invalid refresh token'))
      }

      var decoded = this.secondaryJwtAdapter.decode(body.refreshToken!)

      var user = await prisma.user.findUnique({
        where: {
          id: decoded.id,
        }
      })

      if (!user) {
        securityEventCounter.inc({ event_type: 'invalid_refresh_token', route: '/oauth/token' })
        return badRequest(new Error('Invalid refresh token'))
      }

      var token = this.jwtAdapter.encode(user, '8h')
      var refreshToken = this.secondaryJwtAdapter.encode(user, '7d')

      return ok({
        token,
        refreshToken
      })
    }
  }

  async editUser(
    request: HttpRequest<(typeof editUserSchema._output)>,
  ): Promise<HttpResponse> {
    const user = request.auth!.user

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        ...request.body!,
      }
    })

    var userWithoutPassword = omit(updatedUser, ['password', 'role'])

    return ok(userWithoutPassword)
  }
}