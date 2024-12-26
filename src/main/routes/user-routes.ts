import { Router } from 'express'
import { createUserSchema } from '../schemas/user/create-user-schema'
import { adaptRoute } from '../adapters/express-route-adapter'
import { UserController } from '../../presentation/controllers/user-controller'
import { SchemaAdapter } from '../../infra/schema/schema-adapter'
import { makeUserController } from '../factories/user-factory'

export default (router: Router): void => {
  const baseRoute = '/user'
  const controller = makeUserController()

  router.post(baseRoute, adaptRoute(controller, controller.createUser, new SchemaAdapter(createUserSchema)))
}
