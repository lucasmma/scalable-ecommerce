import { BcryptAdapter } from '../../infra/criptography/bcrypt-adapter'
import { HttpRequest, HttpResponse } from '../protocols'
import { ok } from '../helpers/http-helper'
import prisma from '../../main/config/prisma'
import { omit } from '../helpers/omit-field'
import { createProductCategorySchema } from '../../main/schemas/product-category/create-product-category-schema'
import { queryListProductCategorySchema } from '../../main/schemas/product-category/query-list-product-category-schema'

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
  
  async editProductCategory(
    request: HttpRequest<( typeof createProductCategorySchema._output)>,
  ): Promise<HttpResponse> {
    const body = request.body!

    const productCategory = await prisma.productCategory.update({
      data: {
        ...body,
      },
      where: {
        id: request.params!.id
      }
    })

    return ok(productCategory)
  }

  async deleteProductCategory(
    request: HttpRequest,
  ): Promise<HttpResponse> {
    const productCategory = await prisma.productCategory.update({
      where: {
        id: request.params!.id
      },
      data: {
        deleted: true
      }
    })

    return ok(productCategory)
  }

  async getProductCategories(
    request: HttpRequest<null, (typeof queryListProductCategorySchema._output)>,
  ): Promise<HttpResponse> {

    var isAdmin = request.auth?.user.role === 'ADMIN'

    var where = {}
    if(!isAdmin) {
      where = {
        deleted: false
      }
    }
    var include = {}
    if(request.query?.include_products) {
      include = {
        products: {
          where: {
            deleted: false
          }
        }
      }
    }

    var productCategories = await prisma.productCategory.findMany({
      where, include
    })

    if(request.auth?.user.role !== 'ADMIN'){
      ok(productCategories.map(productCategory => {
        return omit(productCategory, ['deleted'])
      }))
    }

    return ok(productCategories)
  }

}