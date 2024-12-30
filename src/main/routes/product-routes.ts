import { Router } from 'express'
import { adaptAuthRoute } from '../route-adapters/auth-route-adapter'
import { adaptRoute } from '../route-adapters/controller-route-adapter'
import { JwtAdapter } from '../../infra/auth/jwt-adapter'
import env from '../config/env'
import { makeProductController } from '../factories/product-factory'
import { createProductSchema } from '../schemas/product/create-product-schema'
import { idSchema } from '../schemas/id-schema'
import { editProductSchema } from '../schemas/product/edit-product-schema'

/**
 * @openapi
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "cl1j9c9f0g2b0a0h6jj0"
 *         name:
 *           type: string
 *           example: "Smartphone"
 *         description:
 *           type: string
 *           example: "A high-end smartphone with 128GB storage."
 *         price:
 *           type: integer
 *           example: 999
 *         deleted:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-12-30T00:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-12-30T00:00:00Z"
 *         categoryId:
 *           type: string
 *           example: "cl1j9c9f0g2b0a0h6jj0"
 *       required:
 *         - id
 *         - name
 *         - description
 *         - price
 *         - deleted
 *         - createdAt
 *         - updatedAt
 *       description: |
 *         Product schema representing a product in the system.
 *         - `id`: Unique identifier for the product.
 *         - `name`: The name of the product.
 *         - `description`: The description of the product.
 *         - `price`: The price of the product.
 *         - `deleted`: A boolean indicating whether the product is deleted (soft delete).
 *         - `createdAt`: Timestamp of product creation.
 *         - `updatedAt`: Timestamp of the last update to the product.
 *         - `categoryId`: The ID of the category the product belongs to (optional).
 *       example:
 *         id: "cl1j9c9f0g2b0a0h6jj0"
 *         name: "Smartphone"
 *         description: "A high-end smartphone with 128GB storage."
 *         price: 999
 *         deleted: false
 *         createdAt: "2024-12-30T00:00:00Z"
 *         updatedAt: "2024-12-30T00:00:00Z"
 *         categoryId: "cl1j9c9f0g2b0a0h6jj0"
 * 
 * /product:
 *   post:
 *     summary: Create a new product
 *     description: Create a new product in the system.
 *     security:
 *       - BearerAuth: [] 
 *     tags:
 *       - Products
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProduct'
 *     responses:
 *       200:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *   get:
 *     summary: Retrieve a list of products
 *     description: Fetch all products available in the system.
 *     security:
 *       - BearerAuth: [] 
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 * /product/{id}:
 *   put:
 *     summary: Update a product
 *     description: Update an existing product in the system.
 *     security:
 *       - BearerAuth: [] 
 *     tags:
 *       - Products
 *     parameters:
 *       - $ref: '#/components/parameters/IdParameter'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EditProduct'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *   delete:
 *     summary: Delete a product
 *     description: Delete an existing product in the system (soft delete).
 *     security:
 *       - BearerAuth: [] 
 *     tags:
 *       - Products
 *     parameters:
 *       - $ref: '#/components/parameters/IdParameter'
 *     responses:
 *       200:
 *         description: Product deleted successfully (soft delete)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 * /product/category/{id}:
 *   get:
 *     summary: Retrieve products by category
 *     description: Fetch all products in a specific category.
 *     security:
 *       - BearerAuth: [] 
 *     tags:
 *       - Products
 *     parameters:
 *       - $ref: '#/components/parameters/IdParameter'
 *     responses:
 *       200:
 *         description: A list of products in the specified category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */

export default (router: Router): void => {
  const baseRoute = '/product'
  const jwtAdapter = new JwtAdapter(env.JWT_SECRET)
  const controller = makeProductController()
  router.post(baseRoute, adaptAuthRoute(jwtAdapter, 'ADMIN') , adaptRoute(controller, controller.createProduct, { body: createProductSchema }))
  router.put(baseRoute + '/:id', adaptAuthRoute(jwtAdapter, 'ADMIN') , adaptRoute(controller, controller.editProduct, { param: idSchema, body: editProductSchema }))
  router.delete(baseRoute + '/:id', adaptAuthRoute(jwtAdapter, 'ADMIN') , adaptRoute(controller, controller.deleteProduct, { param: idSchema }))
  router.get(baseRoute, adaptAuthRoute(jwtAdapter) , adaptRoute(controller, controller.getProducts))
  router.get(baseRoute + '/category/:id', adaptAuthRoute(jwtAdapter) , adaptRoute(controller, controller.getProductsByCategory, { param: idSchema }))
}
