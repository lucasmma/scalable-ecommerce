import { Router } from 'express'
import { createUserSchema } from '../schemas/user/create-user-schema'
import { adaptRoute } from '../adapters/express-route-adapter'
import { UserController } from '../../presentation/controllers/user-controller'
import { SchemaAdapter } from '../../infra/schema/schema-adapter'

export default (router: Router, controller: UserController): void => {
  const baseRoute = '/user'

  router.post(baseRoute, adaptRoute(controller, controller.createUser, new SchemaAdapter(createUserSchema)))
}
