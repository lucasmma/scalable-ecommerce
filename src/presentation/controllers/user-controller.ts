import { BcryptAdapter } from '../../infra/criptography/bcrypt-adapter'
import { HttpRequest, HttpResponse } from '../protocols'
import { badRequest, ok } from '../helpers/http-helper'
import prisma from '../../main/config/prisma'
import env from '../../main/config/env'

export class UserController {
  constructor(private readonly bcrypt: BcryptAdapter) {
    this.bcrypt = bcrypt
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
        password: hashedPassword,
      }
    })

    // TODO: implement jwt management

    return ok({
      ...user,
    })
  }
}