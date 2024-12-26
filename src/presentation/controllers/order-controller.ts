import { HttpRequest, HttpResponse } from '../protocols'
import { ok } from '../helpers/http-helper'
import prisma from '../../main/config/prisma'
import { updateCartItemsSchema } from '../../main/schemas/order/update-cart-items-schema'

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

}