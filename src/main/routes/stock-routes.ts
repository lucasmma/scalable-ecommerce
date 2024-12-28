import { Router } from 'express'
import { adaptAuthRoute } from '../adapters/auth-route-adapter'
import { adaptRoute } from '../adapters/controller-route-adapter'
import { JwtAdapter } from '../../infra/auth/jwt-adapter'
import env from '../config/env'
import { idSchema } from '../schemas/id-schema'
import { makeStockController } from '../factories/stock-factory'
export default (router: Router): void => {
  const baseRoute = '/stock/product'
  const jwtAdapter = new JwtAdapter(env.JWT_SECRET)
  const controller = makeStockController()
  router.post(baseRoute + '/:id/add' , adaptAuthRoute(jwtAdapter, 'ADMIN') , adaptRoute(controller, controller.addStockFromProduct, { param: idSchema }))
  router.post(baseRoute + '/:id/remove', adaptAuthRoute(jwtAdapter, 'ADMIN') , adaptRoute(controller, controller.addStockFromProduct, { param: idSchema }))
}
