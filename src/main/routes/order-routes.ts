import { Router } from 'express'
import { makeOrderController } from '../factories/order-factory'
import { adaptRoute } from '../route-adapters/controller-route-adapter'
import env from '../config/env'
import { JwtAdapter } from '../../infra/auth/jwt-adapter'
import { adaptAuthRoute } from '../route-adapters/auth-route-adapter'
import { updateCartItemsSchema } from '../schemas/order/update-cart-items-schema'
import { payCartSchema } from '../schemas/order/pay-cart-schema'
import { idSchema } from '../schemas/id-schema'

/**
 * @openapi
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "cl1j9c9f0g2b0a0h6jj0"
 *         total:
 *           type: integer
 *           example: 1500
 *         address:
 *           type: string
 *           example: "1234 Elm Street, Springfield"
 *         status:
 *           type: string
 *           enum: [PENDING, PAID, SHIPPED, DELIVERED, CANCELED]
 *           example: "PENDING"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-12-30T00:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-12-30T00:00:00Z"
 *         userId:
 *           type: string
 *           example: "cl1j9c9f0g2b0a0h6jj0"
 *       required:
 *         - id
 *         - total
 *         - status
 *         - createdAt
 *         - updatedAt
 *         - userId
 *       description: |
 *         Order schema representing an order placed by a user.
 *         - `id`: Unique identifier for the order.
 *         - `total`: The total amount for the order in cents (e.g., 1500 = $15.00).
 *         - `address`: The delivery address for the order (optional).
 *         - `status`: The current status of the order (e.g., `PENDING`, `PAID`, `SHIPPED`, `DELIVERED`, `CANCELED`).
 *         - `createdAt`: Timestamp of order creation.
 *         - `updatedAt`: Timestamp of the last update to the order.
 *         - `userId`: The ID of the user who placed the order.
 *       example:
 *         id: "cl1j9c9f0g2b0a0h6jj0"
 *         total: 1500
 *         address: "1234 Elm Street, Springfield"
 *         status: "PENDING"
 *         createdAt: "2024-12-30T00:00:00Z"
 *         updatedAt: "2024-12-30T00:00:00Z"
 *         userId: "cl1j9c9f0g2b0a0h6jj0"
 * 
 * /order/update:
 *   post:
 *     summary: Update cart items
 *     description: Update the items in a user's cart.
 *     security:
 *       - BearerAuth: [] 
 *     tags:
 *       - Orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCartItems'
 *     responses:
 *       200:
 *         description: Cart items updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 * 
 * /order:
 *   get:
 *     summary: Retrieve all orders
 *     description: Get all orders placed by users.
 *     security:
 *       - BearerAuth: [] 
 *     tags:
 *       - Orders
 *     responses:
 *       200:
 *         description: A list of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 * /order/{id}:
 *   get:
 *     summary: Retrieve a specific order by ID
 *     description: Get details of a specific order using its ID.
 *     security:
 *       - BearerAuth: [] 
 *     tags:
 *       - Orders
 *     parameters:
 *       - $ref: '#/components/parameters/IdParameter'
 *     responses:
 *       200:
 *         description: A specific order
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 * 
 * /order/{id}/pay:
 *   post:
 *     summary: Pay for a cart
 *     description: Proceed with the payment for an order.
 *     security:
 *       - BearerAuth: [] 
 *     tags:
 *       - Orders
 *     parameters:
 *       - $ref: '#/components/parameters/IdParameter'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PayCart'
 *     responses:
 *       200:
 *         description: Cart paid successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 * 
 * /order/{id}/cancel:
 *   post:
 *     summary: Cancel cart
 *     description: Cancel cart and refund money.
 *     security:
 *       - BearerAuth: [] 
 *     tags:
 *       - Orders
 *     parameters:
 *       - $ref: '#/components/parameters/IdParameter'
 *     responses:
 *       200:
 *         description: Cart paid successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 * 
 * /order/{id}/delivery:
 *   post:
 *     summary: Mark an order as delivered
 *     description: Admin can mark an order as delivered.
 *     security:
 *       - BearerAuth: [] 
 *     tags:
 *       - Orders
 *     parameters:
 *       - $ref: '#/components/parameters/IdParameter'
 *     responses:
 *       200:
 *         description: Order marked as delivered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 */

export default (router: Router): void => {
  const baseRoute = '/order'

  const jwtAdapter = new JwtAdapter(env.JWT_SECRET)
  const controller = makeOrderController()

  router.post(baseRoute + '/update', adaptAuthRoute(jwtAdapter, 'USER'), adaptRoute(controller, controller.updateCartItems, { body: updateCartItemsSchema }))
  router.post(baseRoute + '/:id/pay', adaptAuthRoute(jwtAdapter, 'USER'), adaptRoute(controller, controller.payCart, { body: payCartSchema }))
  router.post(baseRoute + '/:id/cancel', adaptAuthRoute(jwtAdapter, 'USER'), adaptRoute(controller, controller.cancelOrder, { param: idSchema }))
  router.post(baseRoute + '/:id/delivery', adaptAuthRoute(jwtAdapter, 'ADMIN'), adaptRoute(controller, controller.deliveryOrder, { param: idSchema }))
  router.get(baseRoute, adaptAuthRoute(jwtAdapter), adaptRoute(controller, controller.getOrders))
  router.get(baseRoute + '/:id', adaptAuthRoute(jwtAdapter), adaptRoute(controller, controller.getOrder))
}
