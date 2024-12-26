import { Express, Router } from 'express'
import userRoutes from '../routes/user-routes'
import productRoutes from '../routes/product-routes'
import productCategoryRoutes from '../routes/product-category-route'

export default (app: Express): void => {
  const router = Router()
  app.use('/api/v1', router)
  userRoutes(router)
  productRoutes(router)
  productCategoryRoutes(router)
}