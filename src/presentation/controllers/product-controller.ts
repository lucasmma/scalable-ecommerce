import { HttpRequest, HttpResponse } from '../protocols'
import { ok } from '../helpers/http-helper'
import prisma from '../../main/config/prisma'
import { createProductSchema } from '../../main/schemas/product/create-product-schema'
import { omit } from '../helpers/omit-field'
import { CacheAdapter } from '../../infra/cache/cache-adapter'
import { Product } from '@prisma/client'

export class ProductController {
  constructor(private readonly cacheAdapter: CacheAdapter) {
    this.cacheAdapter = cacheAdapter
  }
  async createProduct(
    request: HttpRequest<( typeof createProductSchema._output)>,
  ): Promise<HttpResponse> {

    await this.cacheAdapter.delete('products')

    const body = request.body!

    const product = await prisma.product.create({
      data: {
        ...body
      }
    })

    return ok(product)
    
  }

  async getProducts(
    request: HttpRequest,
  ): Promise<HttpResponse> {
    var products: Product[] | null = await this.cacheAdapter.get<Product[]>('products')
    
    if(!products){
      products = await prisma.product.findMany()
      await this.cacheAdapter.set<Product[]>('products', products)
    }

    if(request.auth?.user.role !== 'ADMIN'){
      ok(products.map(product => {
        return omit(product, ['deleted'])
      }))
    }

    return ok(products)
    
  }

  async getProductsByCategory(request: HttpRequest): Promise<HttpResponse> {
    const { id } = request.params!

    var products = await prisma.product.findMany({
      where: {
        categoryId: id
      }})
    return ok(products)
  }

  async editProduct(request: HttpRequest): Promise<HttpResponse> {
    const {
      categoryId, ...bodyWithoutCategory
    } = request.body!
    const { id } = request.params!

    var connectCategory = {}
    if(categoryId) {
      connectCategory = {
        category: {
          connect: {
            id: categoryId
          }
        }
      }
    }

    const product = await prisma.product.update({
      where: {
        id
      },
      data: {
        ...bodyWithoutCategory,
        ...connectCategory
      }
    })

    return ok(product)
  }

  async deleteProduct(request: HttpRequest): Promise<HttpResponse> {
    const { id } = request.params!

    await prisma.product.update({
      where: {
        id
      },
      data: {
        deleted: true
      }
    })

    return ok({})
  }
}