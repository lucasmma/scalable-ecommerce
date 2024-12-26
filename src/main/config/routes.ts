import { Express, Router } from 'express'
import userRoutes from '../routes/user-routes'

export default (app: Express): void => {
  const router = Router()
  app.use('/api/v1', router)
  userRoutes(router)
}