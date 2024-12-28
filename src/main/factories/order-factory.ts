import { DbStockMethods } from '../../data/usecases/db-stock-methods'
import { CacheAdapter } from '../../infra/cache/cache-adapter'
import { MailSenderAdapter } from '../../infra/mail/mail-sender-adapter'
import { OrderController } from '../../presentation/controllers/order-controller'
import { redis } from '../config/redis'


export function makeOrderController(): OrderController {
  const stockMethods = new DbStockMethods()
  const mailSenderAdapter = new MailSenderAdapter()
  const cartCacheAdapter = new CacheAdapter(redis, 'cart')
  return new OrderController(stockMethods, mailSenderAdapter, cartCacheAdapter)
}