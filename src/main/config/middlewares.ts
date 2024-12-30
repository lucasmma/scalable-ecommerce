import { Express, Router } from 'express'
import { bodyParser, cors, contentType } from '../middlewares'
import { logRequestInfo } from '../middlewares/log-info'
import { adaptRateLimiterRoute } from '../route-adapters/rate-limiter-route-adapter'
import { RateLimiter } from '../../infra/rate-limiter/rate-limiter-adapter'
import { redis } from './redis'

export default (app: Router): void => {
  var rateLimiterAdapter = new RateLimiter(redis, 5, 60)


  app.use(contentType)
  app.use(bodyParser)
  app.use(cors)
  app.use(logRequestInfo)
  app.use(adaptRateLimiterRoute(rateLimiterAdapter))
}
