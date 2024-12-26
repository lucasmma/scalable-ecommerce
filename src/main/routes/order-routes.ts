import { Router } from 'express'
import { makeOrderController } from '../factories/order-factory'
import { adaptRoute } from '../adapters/controller-route-adapter'
import env from '../config/env'
import { JwtAdapter } from '../../infra/auth/jwt-adapter'
import { adaptAuthRoute } from '../adapters/auth-route-adapter'
import { updateCartItemsSchema } from '../schemas/order/update-cart-items-schema'
import { payCartSchema } from '../schemas/order/pay-cart-schema'
import { idSchema } from '../schemas/id-schema'

export default (router: Router): void => {
  const baseRoute = '/order'

  const jwtAdapter = new JwtAdapter(env.JWT_SECRET)
  const controller = makeOrderController()

  router.post(baseRoute + '/update', adaptAuthRoute(jwtAdapter, 'USER'), adaptRoute(controller, controller.updateCartItems, { body: updateCartItemsSchema }))
  router.post(baseRoute + '/pay', adaptAuthRoute(jwtAdapter, 'USER'), adaptRoute(controller, controller.payCart, { body: payCartSchema }))
  router.post(baseRoute + '/delivery', adaptAuthRoute(jwtAdapter, 'ADMIN'), adaptRoute(controller, controller.deliveryOrder, { param: idSchema }))
  router.get(baseRoute, adaptAuthRoute(jwtAdapter), adaptRoute(controller, controller.getOrders))
  router.get(baseRoute + '/:id', adaptAuthRoute(jwtAdapter), adaptRoute(controller, controller.getOrder))
}
