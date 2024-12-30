import { Router } from 'express'
import { makeProductCategoryController } from '../factories/product-category-factory'
import { JwtAdapter } from '../../infra/auth/jwt-adapter'
import env from '../config/env'
import { adaptAuthRoute } from '../route-adapters/auth-route-adapter'
import { adaptRoute } from '../route-adapters/controller-route-adapter'
import { createProductCategorySchema } from '../schemas/product-category/create-product-category-schema'
import { idSchema } from '../schemas/id-schema'
import { editProductCategorySchema } from '../schemas/product-category/edit-product-category-schema'
import { queryListProductCategorySchema } from '../schemas/product-category/query-list-product-category-schema'

export default (router: Router): void => {
  const baseRoute = '/product-category'
  const controller = makeProductCategoryController()
  const jwtAdapter = new JwtAdapter(env.JWT_SECRET)

/**
 * @openapi
 * components:
 *   schemas:
 *     ProductCategory:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "12345"
 *         name:
 *           type: string
 *           example: "Electronics"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2021-09-01T00:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2021-09-01T00:00:00Z"
 * /product-category:
 *   get:
 *     summary: Retrieve a list of product categories
 *     description: Fetch all product categories available in the system.
 *     security:
 *       - BearerAuth: [] 
 *     tags:
 *       - Product Categories
 *     parameters:
 *       - name: include_products
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [true, false]
 *           example: "true"
 *     responses:
 *       200:
 *         description: A list of product categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductCategory'
 *   post:
 *     summary: Create a new product category
 *     description: Create a new product category in the system.
 *     security:
 *       - BearerAuth: [] 
 *     tags:
 *       - Product Categories
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductCategory'
 *     responses:
 *       200:
 *         description: Product category created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductCategory'
 * 
 * /product-category/{id}:
 *   put:
 *     summary: Update a product category
 *     description: Update a product category in the system.
 *     security:
 *       - BearerAuth: [] 
 *     tags:
 *       - Product Categories
 *     parameters:
 *       - $ref: '#/components/parameters/IdParameter'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EditProductCategory'
 *     responses:
 *       200:
 *         description: Product category updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductCategory'
 *   delete:
 *     summary: Delete a product category
 *     description: Delete a product category in the system.
 *     security:
 *       - BearerAuth: [] 
 *     tags:
 *       - Product Categories
 *     parameters:
 *       - $ref: '#/components/parameters/IdParameter'
 *     responses:
 *       200:
 *         description: Product category deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductCategory'
 * 
 */

  router.post(baseRoute, adaptAuthRoute(jwtAdapter, 'ADMIN') , adaptRoute(controller, controller.createProductCategory, { body: createProductCategorySchema }))
  router.put(baseRoute + '/:id', adaptAuthRoute(jwtAdapter, 'ADMIN') , adaptRoute(controller, controller.editProductCategory, { param: idSchema, body: editProductCategorySchema }))
  router.get(baseRoute, adaptAuthRoute(jwtAdapter) , adaptRoute(controller, controller.getProductCategories, { query: queryListProductCategorySchema}))
  router.delete(baseRoute + '/:id', adaptAuthRoute(jwtAdapter, 'ADMIN') , adaptRoute(controller, controller.deleteProductCategory, { param: idSchema }))
}
