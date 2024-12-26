import { HttpRequest, HttpResponse } from '../protocols'
import { ok } from '../helpers/http-helper'
import prisma from '../../main/config/prisma'
import { updateCartItemsSchema } from '../../main/schemas/order/update-cart-items-schema'
import { payCartSchema } from '../../main/schemas/order/pay-cart-schema'
import { idSchema } from '../../main/schemas/id-schema'

export class OrderController {
  constructor() {
  }
  async updateCartItems (
    request: HttpRequest<( typeof updateCartItemsSchema._output)>,
  ): Promise<HttpResponse> {
    const { user } = request.auth!
    const body = request.body!

    var include = {
      items: {
        include: {
          product: true
        }
      }
    }

    var order = await prisma.order.findFirst({
      where: {
        userId: user.id,
        status: 'CART'
      },
      include
    })

    // find all products added to cart to calculate total and add to order

    if(!order) {
      order = await prisma.order.create({
        data: {
          userId: user.id,
          status: 'CART',
          total: 0
        },
        include
      })

      ok(order)
    }

    return ok(order)
  }

  async payCart (
    request: HttpRequest<(typeof payCartSchema._output)>,
  ): Promise<HttpResponse> {
    const { user } = request.auth!
    const { address } = request.body!
    const { id } = request.params!

    var order = await prisma.order.findFirst({
      where: {
        id
      }
    })

    if(!order || order.total === 0) {
      return ok({
        message: 'Cart is empty'
      })
    }

    order = await prisma.order.update({
      where: {
        id
      },
      data: {
        status: 'CONFIRMED',
      }
    })

    return ok(order)
  }

  async deliveryOrder (
    request: HttpRequest,
  ): Promise<HttpResponse> {
    const { id } = request.params!

    var order = await prisma.order.update({
      where: {
        id
      },
      data: {
        status: 'DELIVERED',
      }
    })

    return ok(order)
  }

  async getOrders (
    request: HttpRequest,
  ): Promise<HttpResponse> {
    const { user } = request.auth!

    var where = {}
    if(user.role !== 'ADMIN') {
      where = {
        userId: user.id
      }
    }


    var orders = await prisma.order.findMany(
      {
        where
      }
    )

    return ok(orders)
  }

  async getOrder (
    request: HttpRequest,
  ): Promise<HttpResponse> {
    const { id } = request.params!
    var order = await prisma.order.findFirst({
      where: {
        id
      }
    })

    return ok(order)
  }

}