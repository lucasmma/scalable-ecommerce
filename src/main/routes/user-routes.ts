import { Router } from 'express'
import { createUserSchema } from '../schemas/user/create-user-schema'
import { adaptZod } from '../adapters/express-zod-adapter'
import { adaptRoute } from '../adapters/express-route-adapter'
import { UserController } from '../../presentation/controllers/user-controller'

export default (router: Router, controller: UserController): void => {
  const baseRoute = '/user'

  router.post(baseRoute, adaptZod(createUserSchema), adaptRoute(controller, controller.createUser))
}
