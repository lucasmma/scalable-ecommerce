import { HttpRequest, HttpResponse } from '../protocols'
import { badRequest, ok } from '../helpers/http-helper'
import prisma from '../../main/config/prisma'
import { updateCartItemsSchema } from '../../main/schemas/order/update-cart-items-schema'
import { payCartSchema } from '../../main/schemas/order/pay-cart-schema'
import { idSchema } from '../../main/schemas/id-schema'
import { Order } from '@prisma/client'

export class OrderController {
  constructor() {
  }

  async updateCartItems(
    request: HttpRequest<(typeof updateCartItemsSchema._output)>
  ): Promise<HttpResponse> {
    const { user } = request.auth!;
    const body = request.body!;
  
    const include = {
      items: {
        include: { product: true },
      },
    };
  
    return prisma.$transaction(async (prisma) => {
      let order = await prisma.order.findFirst({
        where: { userId: user.id, status: 'CART' },
        include,
      });
  
      if (!order) {
        if (body.removeProducts && body.removeProducts.length > 0) {
          return badRequest(new Error('Cannot remove products from an empty cart'));
        }
  
        // Prepare initial items for a new cart
        const initialItems = body.addProducts!.map((product) => ({
          productId: product.productId,
          quantity: product.quantity,
          price: 0, // TODO: Calculate price
        }));
  
        order = await prisma.order.create({
          data: {
            userId: user.id,
            status: 'CART',
            total: 0,
            items: { createMany: { data: initialItems } },
          },
          include,
        });
  
        return ok(order);
      }
  
      const items = order.items;
  
      // Handle product removal
      if (body.removeProducts && body.removeProducts.length > 0) {
        const invalidRemovals = body.removeProducts.filter(
          (removeProduct) => !items.some((item) => item.productId === removeProduct)
        );
  
        if (invalidRemovals.length > 0) {
          return badRequest(new Error('Some products are not in the cart'));
        }
  
        await prisma.orderItem.deleteMany({
          where: {
            orderId: order.id,
            productId: { in: body.removeProducts },
          },
        });
      }
  
      // Handle product addition
      if (body.addProducts && body.addProducts.length > 0) {
        const existingProductIds = new Set(items.map((item) => item.productId));
  
        const productsToUpdate = [];
        const productsToCreate = [];
  
        for (const product of body.addProducts) {
          if (existingProductIds.has(product.productId)) {
            productsToUpdate.push(product);
          } else {
            productsToCreate.push({
              orderId: order.id,
              productId: product.productId,
              quantity: product.quantity,
              price: 0, // TODO: Calculate price
            });
          }
        }
  
        // Update existing items
        if (productsToUpdate.length > 0) {
          const updatePromises = productsToUpdate.map((product) =>
            prisma.orderItem.updateMany({
              where: {
                orderId: order!.id,
                productId: product.productId,
              },
              data: { quantity: { increment: product.quantity } },
            })
          );
          await Promise.all(updatePromises);
        }
  
        // Create new items
        if (productsToCreate.length > 0) {
          await prisma.orderItem.createMany({
            data: productsToCreate,
          });
        }
      }
  
      // Refresh the order with updated items
      const updatedOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include,
      });
  
      return ok(updatedOrder);
    });
  }  

  async payCart (
    request: HttpRequest<(typeof payCartSchema._output)>,
  ): Promise<HttpResponse> {
    const { user } = request.auth!
    const { address } = request.body!
    const { id } = request.params!

    var order = await prisma.order.findFirst({
      where: {
        userId: user.id,
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
    const { user } = request.auth!

    var where: {id: string, userId?: string} = {
      id
    }

    if(user.role !== 'ADMIN') {
      where = {
        id,
        userId: user.id
      }
    }

    var order = await prisma.order.findFirst({
      where
    })

    return ok(order)
  }
}