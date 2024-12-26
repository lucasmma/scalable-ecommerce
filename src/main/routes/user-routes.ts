import { Router } from 'express'
import { createUserSchema } from '../schemas/user/create-user-schema'
import { adaptRoute } from '../adapters/controller-route-adapter'
import { UserController } from '../../presentation/controllers/user-controller'
import { SchemaAdapter } from '../../infra/schema/schema-adapter'
import { makeUserController } from '../factories/user-factory'
import { oauthTokenSchema } from '../schemas/user/oauth-token-schema'
import { adaptAuthRoute } from '../adapters/auth-route-adapter'
import { editUserSchema } from '../schemas/user/edit-user-schema'

export default (router: Router): void => {
  const baseRoute = '/user'
  const controller = makeUserController()

  router.post(baseRoute, adaptRoute(controller, controller.createUser, new SchemaAdapter(createUserSchema)))
  router.post('/oauth', adaptRoute(controller, controller.oauthToken, new SchemaAdapter(oauthTokenSchema)))
  router.put(baseRoute, adaptAuthRoute(controller.jwtAdapter) , adaptRoute(controller, controller.editUser, new SchemaAdapter(editUserSchema)))
}
