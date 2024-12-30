import express, { Router } from 'express'
import setupMiddlewares from './middlewares'
import setupRoutes from './routes'
import setupSwaggerRoute from '../routes/swagger-route'

const app = express()
setupSwaggerRoute(app)
const router = Router()
app.use('/api/v1', router)
setupMiddlewares(router)
setupRoutes(router)

export default app
