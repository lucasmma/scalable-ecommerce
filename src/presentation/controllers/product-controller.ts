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
    const body = request.body!

    const product = await prisma.product.create({
      data: {
        ...body
      }
    })

    await this.cacheAdapter.set<Product>(product.id, product)
    return ok(product)
    
  }

  async getProducts(request: HttpRequest): Promise<HttpResponse> {
    const isAdmin = request.auth?.user.role === 'ADMIN';
    
    // If the user is not an admin, check the cache first
    if (!isAdmin) {
      const cachedProducts = await this.cacheAdapter.getMany<Product[]>();
      if (cachedProducts) {
        return ok(cachedProducts);
      }
    }
  
    // Set the where clause for non-admins to filter out deleted products
    const where = isAdmin ? {} : { deleted: false };
  
    // Fetch products from the database
    const products = await prisma.product.findMany({ where });
  
    // If the user is not an admin, omit the 'deleted' field
    if (!isAdmin) {
      const filteredProducts = products.map(product => omit(product, ['deleted']));
      return ok(filteredProducts);
    }
  
    return ok(products);
  }  

  async getProductsByCategory(request: HttpRequest): Promise<HttpResponse> {
    const { id } = request.params!    
    const isAdmin = request.auth?.user.role === 'ADMIN';

    const where = isAdmin ? {} : { deleted: false };

    var products = await prisma.product.findMany({
      where: {
        categoryId: id,
        ...where
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

    await this.cacheAdapter.set<Product>(id, product)

    return ok(product)
  }

  async deleteProduct(request: HttpRequest): Promise<HttpResponse> {
    const { id } = request.params!

    const product = await prisma.product.update({
      where: {
        id
      },
      data: {
        deleted: true
      }
    })

    await this.cacheAdapter.delete(id)
    return ok(product)
  }
}