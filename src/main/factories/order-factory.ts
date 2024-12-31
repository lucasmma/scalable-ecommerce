import { DbStockMethods } from '../../data/usecases/db-stock-methods'
import { CacheAdapter } from '../../infra/cache/cache-adapter'
import { MailSenderAdapter } from '../../infra/mail/mail-sender-adapter'
import { MockPaymentGateway } from '../../infra/payment-gateway/mock-payment-gateway'
import { OrderController } from '../../presentation/controllers/order-controller'
import { mailer } from '../config/mailer'
import { redis } from '../config/redis'


export function makeOrderController(): OrderController {
  const stockMethods = new DbStockMethods()
  const mailSenderAdapter = new MailSenderAdapter(mailer)
  const cartCacheAdapter = new CacheAdapter(redis, 'cart')
  const mockPaymentGateway = new MockPaymentGateway()
  return new OrderController(stockMethods, mailSenderAdapter, cartCacheAdapter, mockPaymentGateway)
}