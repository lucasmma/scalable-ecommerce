import { BcryptAdapter } from '../../infra/criptography/bcrypt-adapter'
import { HttpRequest, HttpResponse } from '../protocols'
import { ok } from '../helpers/http-helper'
import prisma from '../../main/config/prisma'
import { omit } from '../helpers/omit-field'
import { createProductCategorySchema } from '../../main/schemas/product-category/create-product-category-schema'

export class ProductCategoryController {
  constructor() {
  }
  async createProductCategory(
    request: HttpRequest<( typeof createProductCategorySchema._output)>,
  ): Promise<HttpResponse> {
    const body = request.body!

    const productCategory = await prisma.productCategory.create({
      data: {
        ...body,
      }
    })

    return ok(productCategory)
  }

  async deleteProductCategory(
    request: HttpRequest,
  ): Promise<HttpResponse> {
    const id = ''
    await prisma.productCategory.update({
      where: {
        id: id
      },
      data: {
        deleted: true
      }
    })

    return ok({})
  }

  async getProductCategories(
    request: HttpRequest,
  ): Promise<HttpResponse> {

    var isAdmin = request.auth?.user.role === 'ADMIN'

    var where = {}

    if(!isAdmin) {
      where = {
        deleted: false
      }
    }

    var productCategories = await prisma.productCategory.findMany(where)

    if(request.auth?.user.role !== 'ADMIN'){
      ok(productCategories.map(productCategory => {
        return omit(productCategory, ['deleted'])
      }))
    }

    return ok(productCategories)
  }

}