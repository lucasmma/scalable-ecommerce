import express, { Router } from 'express'
import setupMiddlewares from './middlewares'
import setupRoutes from './routes'
import setupSwaggerRoute from '../routes/swagger-route'
import setupMetricsRoute from '../routes/metrics-route'

const app = express()
setupSwaggerRoute(app)
setupMetricsRoute(app)
const router = Router()
app.use('/api/v1', router)
setupMiddlewares(router)
setupRoutes(router)

export default app
