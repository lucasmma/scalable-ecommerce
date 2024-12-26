import { Router } from 'express'
import { makeProductCategoryController } from '../factories/product-category-factory'
import { JwtAdapter } from '../../infra/auth/jwt-adapter'
import env from '../config/env'
import { adaptAuthRoute } from '../adapters/auth-route-adapter'
import { adaptRoute } from '../adapters/controller-route-adapter'
import { createProductCategorySchema } from '../schemas/product-category/create-product-category-schema'
import { idSchema } from '../schemas/id-schema'
import { editProductCategorySchema } from '../schemas/product-category/edit-product-category-schema'

export default (router: Router): void => {
  const baseRoute = '/product-category'
  const controller = makeProductCategoryController()
  const jwtAdapter = new JwtAdapter(env.JWT_SECRET)
  router.post(baseRoute, adaptAuthRoute(jwtAdapter, 'ADMIN') , adaptRoute(controller, controller.createProductCategory, { body: createProductCategorySchema }))
  router.put(baseRoute + '/:id', adaptAuthRoute(jwtAdapter, 'ADMIN') , adaptRoute(controller, controller.editProductCategory, { param: idSchema, body: editProductCategorySchema }))
  router.get(baseRoute, adaptAuthRoute(jwtAdapter) , adaptRoute(controller, controller.getProductCategories))
  router.delete(baseRoute + '/:id', adaptAuthRoute(jwtAdapter) , adaptRoute(controller, controller.deleteProductCategory, { param: idSchema }))
}
