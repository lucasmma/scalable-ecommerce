import { Router } from 'express'
import { adaptAuthRoute } from '../route-adapters/auth-route-adapter'
import { adaptRoute } from '../route-adapters/controller-route-adapter'
import { JwtAdapter } from '../../infra/auth/jwt-adapter'
import env from '../config/env'
import { idSchema } from '../schemas/id-schema'
import { makeStockController } from '../factories/stock-factory'
/**
 * @openapi
 * components:
 *   schemas:
 *     StockUpdate:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "cl1j9c9f0g2b0a0h6jj0"
 *         quantity:
 *           type: integer
 *           example: 10
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-12-30T00:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-12-30T00:00:00Z"
 *       required:
 *         - id
 *         - quantity
 *         - createdAt
 *         - updatedAt
 *       additionalProperties: false
 *       description: |
 *         Schema for stock updates, reflecting the quantity of stock for a product.
 *         - `id`: Unique identifier for the stock entry.
 *         - `quantity`: The number of items in stock.
 *         - `createdAt`: Timestamp for when the stock entry was created.
 *         - `updatedAt`: Timestamp for when the stock entry was last updated.
 *       example:
 *         id: "cl1j9c9f0g2b0a0h6jj0"
 *         quantity: 10
 *         createdAt: "2024-12-30T00:00:00Z"
 *         updatedAt: "2024-12-30T00:00:00Z"
 * 
 * /stock/product/{id}/add:
 *   post:
 *     summary: Add stock to a product
 *     description: Add stock to a specific product in the system.
 *     security:
 *       - BearerAuth: [] 
 *     tags:
 *       - Stock
 *     parameters:
 *       - $ref: '#/components/parameters/IdParameter'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddRemoveStock'
 *     responses:
 *       200:
 *         description: Stock added successfully
 *         content:
 *           application/json:
 *             schema:
 *              $ref: '#/components/schemas/StockUpdate'
 * 
 * /stock/product/{id}/remove:
 *   post:
 *     summary: Remove stock from a product
 *     description: Remove stock from a specific product in the system.
 *     security:
 *       - BearerAuth: [] 
 *     tags:
 *       - Stock
 *     parameters:
 *       - $ref: '#/components/parameters/IdParameter'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddRemoveStock'
 *     responses:
 *       200:
 *         description: Stock removed successfully
 *         content:
 *           application/json:
 *             schema:
 *              $ref: '#/components/schemas/StockUpdate'
 */

export default (router: Router): void => {
  const baseRoute = '/stock/product'
  const jwtAdapter = new JwtAdapter(env.JWT_SECRET)
  const controller = makeStockController()
  router.post(baseRoute + '/:id/add' , adaptAuthRoute(jwtAdapter, 'ADMIN') , adaptRoute(controller, controller.addStockFromProduct, { param: idSchema }))
  router.post(baseRoute + '/:id/remove', adaptAuthRoute(jwtAdapter, 'ADMIN') , adaptRoute(controller, controller.removeStockFromProduct, { param: idSchema }))
}
