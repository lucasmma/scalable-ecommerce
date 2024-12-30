
import { NextFunction, Request, Response, Router } from 'express'
import swaggerUi from 'swagger-ui-express';
import { swaggerDocs } from '../config/swagger'
import { Express } from 'express'
export default (app: Express): void => {
  const router = Router()
  app.use(router)

  const baseRoute = '/api-docs'
  router.use(baseRoute, swaggerUi.serve, swaggerUi.setup(swaggerDocs))
}
