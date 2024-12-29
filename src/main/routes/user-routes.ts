import { Router } from 'express'
import { createUserSchema } from '../schemas/user/create-user-schema'
import { adaptRoute } from '../route-adapters/controller-route-adapter'
import { UserController } from '../../presentation/controllers/user-controller'
import { SchemaAdapter } from '../../infra/schema/schema-adapter'
import { makeUserController } from '../factories/user-factory'
import { oauthTokenSchema } from '../schemas/user/oauth-token-schema'
import { adaptAuthRoute } from '../route-adapters/auth-route-adapter'
import { editUserSchema } from '../schemas/user/edit-user-schema'

export default (router: Router): void => {
  const baseRoute = '/user'
  const controller = makeUserController()

  router.post(baseRoute, adaptRoute(controller, controller.createUser, { body: createUserSchema }))
  router.post('/oauth', adaptRoute(controller, controller.oauthToken, { body: oauthTokenSchema }))
  router.put(baseRoute, adaptAuthRoute(controller.jwtAdapter) , adaptRoute(controller, controller.editUser, { body: editUserSchema }))
}
