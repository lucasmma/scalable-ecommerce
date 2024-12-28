import { Express, Router } from 'express'
import userRoutes from '../routes/user-routes'
import productRoutes from '../routes/product-routes'
import productCategoryRoutes from '../routes/product-category-route'
import orderRoutes from '../routes/order-routes'
import stockRoutes from '../routes/stock-routes'

export default (app: Express): void => {
  const router = Router()
  app.use('/api/v1', router)
  userRoutes(router)
  productRoutes(router)
  productCategoryRoutes(router)
  orderRoutes(router)
  stockRoutes(router)
}