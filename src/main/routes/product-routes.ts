import { Router } from 'express'
import { adaptAuthRoute } from '../adapters/auth-route-adapter'
import { adaptRoute } from '../adapters/controller-route-adapter'
import { JwtAdapter } from '../../infra/auth/jwt-adapter'
import env from '../config/env'
import { makeProductController } from '../factories/product-factory'
import { SchemaAdapter } from '../../infra/schema/schema-adapter'
import { createProductSchema } from '../schemas/product/create-product-schema'
export default (router: Router): void => {
  const baseRoute = '/product'
  const jwtAdapter = new JwtAdapter(env.JWT_SECRET)
  const controller = makeProductController()
  router.post(baseRoute, adaptAuthRoute(jwtAdapter, 'ADMIN') , adaptRoute(controller, controller.createProduct, new SchemaAdapter(createProductSchema)))
  router.get(baseRoute, adaptAuthRoute(jwtAdapter) , adaptRoute(controller, controller.getProducts))
}
