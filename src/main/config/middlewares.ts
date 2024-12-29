import { Express } from 'express'
import { bodyParser, cors, contentType } from '../middlewares'
import { logRequestInfo } from '../middlewares/log-info'
import { adaptRateLimiterRoute } from '../route-adapters/rate-limiter-route-adapter'
import { RateLimiter } from '../../infra/rate-limiter/rate-limiter-adapter'
import { redis } from './redis'

export default (app: Express): void => {
  var rateLimiterAdapter = new RateLimiter(redis, 5, 60)

  app.use(bodyParser)
  app.use(cors)
  app.use(logRequestInfo)
  app.use(contentType)
  app.use(adaptRateLimiterRoute(rateLimiterAdapter))
}
