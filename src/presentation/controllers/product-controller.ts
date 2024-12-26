import { BcryptAdapter } from '../../infra/criptography/bcrypt-adapter'
import { HttpRequest, HttpResponse } from '../protocols'
import { ok } from '../helpers/http-helper'
import prisma from '../../main/config/prisma'
import { createProductSchema } from '../../main/schemas/product/create-product-schema'

export class ProductController {
  constructor() {
  }
  async createProduct(
    request: HttpRequest<( typeof createProductSchema._output)>,
  ): Promise<HttpResponse> {
    const body = request.body!

    const product = await prisma.product.create({
      data: {
        ...body,
        stock: 0
      }
    })

    return ok(product)
    
  }
}