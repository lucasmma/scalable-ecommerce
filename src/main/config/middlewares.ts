import { Express } from 'express'
import { bodyParser, cors, contentType } from '../middlewares'
import { logRequestInfo } from '../middlewares/log-info'

export default (app: Express): void => {
  app.use(bodyParser)
  app.use(cors)
  app.use(logRequestInfo)
  app.use(contentType)
}
