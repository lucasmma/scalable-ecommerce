import { Router } from 'express'
import { makeProductCategoryController } from '../factories/product-category-factory'
import { JwtAdapter } from '../../infra/auth/jwt-adapter'
import env from '../config/env'
import { adaptAuthRoute } from '../adapters/auth-route-adapter'
import { adaptRoute } from '../adapters/controller-route-adapter'
import { createProductCategorySchema } from '../schemas/product-category/create-product-category-schema'
import { SchemaAdapter } from '../../infra/schema/schema-adapter'

export default (router: Router): void => {
  const baseRoute = '/product-category'
  const controller = makeProductCategoryController()
  const jwtAdapter = new JwtAdapter(env.JWT_SECRET)
  router.post(baseRoute, adaptAuthRoute(jwtAdapter, 'ADMIN') , adaptRoute(controller, controller.createProductCategory, new SchemaAdapter(createProductCategorySchema)))
  router.get(baseRoute, adaptAuthRoute(jwtAdapter) , adaptRoute(controller, controller.getProductCategories))
  router.delete(baseRoute, adaptAuthRoute(jwtAdapter) , adaptRoute(controller, controller.deleteProductCategory))
}
