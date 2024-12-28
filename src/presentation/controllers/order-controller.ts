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
      let order = await prisma.order.findFirst({
        where: { userId: user.id, status: 'CART' },
        include,
      });

      var totalSold = order?.total ?? 0

      var itemsToFind = body.addProducts?.map(product => product.productId) ?? []

      // remove products that are already in the cart
      if(order) {
        itemsToFind = itemsToFind.filter(productId => !order!.items.some(item => item.productId === productId))
      }

      var products = await prisma.product.findMany({
        where: {
          id: {
            in: itemsToFind
          }
        },
      })




  
      if (!order) {
        if (body.removeProducts && body.removeProducts.length > 0) {
          return badRequest(new Error('Cannot remove products from an empty cart'));
        }
  
        // Prepare initial items for a new cart
        const initialItems = body.addProducts!.map((product) => {
          var productPrice = products.find(p => p.id === product.productId)!.price
          return {
            productId: product.productId,
            quantity: product.quantity,
            price: productPrice * product.quantity, // TODO: Calculate price
          }
        });
  
        order = await prisma.order.create({
          data: {
            userId: user.id,
            status: 'CART',
            total: calculateTotalPriceFromProducts(products.map(product => ({ product, quantity: body.addProducts!.find(p => p.productId ==product.id)!.quantity }))),
            items: { createMany: { data: initialItems } },
          },
          include,
        });
  
        return ok(order);
      }
  
      const itemsAlreadyInCart = order.items;
  
      // Handle product removal
      if (body.removeProducts && body.removeProducts.length > 0) {
        const invalidRemovals = body.removeProducts.filter(
          (removeProduct) => !itemsAlreadyInCart.some((item) => item.productId === removeProduct)
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
      const updatedItems = []
      const productsToCreate = []
      if (body.addProducts && body.addProducts.length > 0) {
        const existingProductIds = new Set(itemsAlreadyInCart.map((item) => item.productId));
  
        const itemsToUpdate = [];
  
        for (const addProduct of body.addProducts) {
          const product = products.find(p => p.id === addProduct.productId)!
          if (existingProductIds.has(addProduct.productId)) {
            itemsToUpdate.push(addProduct);
          } else {
            productsToCreate.push({
              orderId: order.id,
              productId: addProduct.productId,
              quantity: addProduct.quantity,
              price: product.price * addProduct.quantity, // TODO: Calculate price
            });
          }
        }
  
        // Update existing items
        if (itemsToUpdate.length > 0) {
          for (const product of itemsToUpdate) {
            const item = itemsAlreadyInCart.find((item) => item.productId === product.productId);
            console.log
            const updatedItem = await prisma.orderItem.update({
              where: {
                id: item!.id,
              },
              data: {
                quantity: {
                  increment: product.quantity,
                },
                price: {
                  increment: product.quantity * item!.product.price
                }, // TODO: Calculate price
              },
            });
            updatedItems.push(updatedItem);
          }
        }
  
        // Create new items
        if (productsToCreate.length > 0) {
          await prisma.orderItem.createMany({
            data: productsToCreate,
          });
        }
      }
  
      // Refresh the order with updated items
      // get all updated and created items to calculate the total price
      const updatedAndCreatedItems = [...updatedItems.map((item) => ({
        product: itemsAlreadyInCart.find(i => i.id === item.id)!.product,
        quantity: item.quantity,
      })), ...productsToCreate.map(item => ({
        product: products.find(p => p.id === item.productId)!,
        quantity: item.quantity,
      }))];

      const updatedOrder = await prisma.order.update({
        where: { id: order!.id },
        data: {
          total: calculateTotalPriceFromProducts(updatedAndCreatedItems),
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