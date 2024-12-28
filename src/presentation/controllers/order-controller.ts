import { HttpRequest, HttpResponse } from '../protocols'
import { badRequest, ok } from '../helpers/http-helper'
import prisma from '../../main/config/prisma'
import { updateCartItemsSchema } from '../../main/schemas/order/update-cart-items-schema'
import { payCartSchema } from '../../main/schemas/order/pay-cart-schema'
import { calculateTotalPriceFromProducts } from '../helpers/calculate-total-price'

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
        include: { 
          product: {
            select: { name: true, description: true, price: true }
          } 
        },
      },
    };
  
    return prisma.$transaction(async (prisma) => {
      // Fetch current cart
      let order = await prisma.order.findFirst({
        where: { userId: user.id, status: 'CART' },
        include,
      });
  
      // Collect product IDs to fetch
      let itemsToFind = body.addProducts?.map((product) => product.productId) ?? [];
      // remove products that are already in the cart
      if (order) {
        itemsToFind = itemsToFind.filter((productId) => !order!.items.some((item) => item.productId === productId));
      }
  
      // Fetch products for price calculations
      const products = await prisma.product.findMany({
        where: { id: { in: itemsToFind } },
      });
  
      if (!order) {
        if (body.removeProducts && body.removeProducts.length > 0) {
          return badRequest(new Error('Cannot remove products from an empty cart'));
        }
  
        // Create a new cart
        const initialItems = body.addProducts!.map((product) => {
          const productPrice = products.find(p => p.id === product.productId)!.price
          return {
            productId: product.productId,
            quantity: product.quantity,
            price: productPrice * product.quantity
          }
        });
  
        order = await prisma.order.create({
          data: {
            userId: user.id,
            status: 'CART',
            total: initialItems.reduce((sum, item) => sum + item.price, 0),
            items: { createMany: { data: initialItems } },
          },
          include,
        });
  
        return ok(order);
      }
  
      const itemsAlreadyInCart = order.items;
      const productsToCreate = [];
      const itemsUpdated = []
  
      // Handle product removal
      if (body.removeProducts && body.removeProducts.length > 0) {
        const invalidRemovals = body.removeProducts.filter(
          (productId) => !itemsAlreadyInCart.some((item) => item.productId === productId)
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
      const itemsToUpdate = [];
      if (body.addProducts?.length) {
        const existingProductIds = new Set(itemsAlreadyInCart.map((item) => item.productId));
  
        for (const product of body.addProducts) {
          const productDetails = products.find(p => p.id === product.productId)!;
          if (existingProductIds.has(product.productId)) {
            itemsToUpdate.push({ ...product, price: productDetails.price });
          } else {
            productsToCreate.push({
              orderId: order.id,
              productId: product.productId,
              quantity: product.quantity,
              price: productDetails.price * product.quantity,
            });
          }
        }
  
        // Bulk update existing items
        for (const item of itemsToUpdate) {
          var itemInCart = itemsAlreadyInCart.find((item) => item.productId === item.productId)!
          const updatedItem = await prisma.orderItem.update({
            where: {
              id: itemInCart.id
            },
            data: {
              quantity: { increment: item.quantity },
              price: { increment: item.quantity * item.price },
            },
          });
          itemsUpdated.push(updatedItem);
        }
  
        // Bulk insert new items
        if (productsToCreate.length > 0) {
          await prisma.orderItem.createMany({ data: productsToCreate });
        }
      }
  
      // Recalculate order total
      const updatedAndCreatedItems = [...itemsUpdated, ...productsToCreate];
      const totalSold = updatedAndCreatedItems.reduce((sum, item) => sum + item.price, 0);
  
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          total: totalSold,
        },
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
        address
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
      where, include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                description: true,
                price: true,
              }
            }
          }
        }
      }
    })

    return ok(order)
  }
}