import { Router } from 'express'
import { adaptAuthRoute } from '../route-adapters/auth-route-adapter'
import { adaptRoute } from '../route-adapters/controller-route-adapter'
import { JwtAdapter } from '../../infra/auth/jwt-adapter'
import env from '../config/env'
import { makeProductController } from '../factories/product-factory'
import { createProductSchema } from '../schemas/product/create-product-schema'
import { idSchema } from '../schemas/id-schema'
import { editProductSchema } from '../schemas/product/edit-product-schema'
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
