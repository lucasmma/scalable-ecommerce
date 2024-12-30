import { Express, Router } from 'express' 
import { register } from '../config/registry-metrics'


export default (app: Express): void => {
  const router = Router()
  app.use(router)
  router.get('/metrics', async  (req, res) => {
    res.set('Content-Type', register.contentType)
    res.send(await register.metrics())
  })
}