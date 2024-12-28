import { DbStockMethods } from '../../data/usecases/db-stock-methods'
import { MailSenderAdapter } from '../../infra/mail/mail-sender-adapter'
import { OrderController } from '../../presentation/controllers/order-controller'


export function makeOrderController(): OrderController {
  const stockMethods = new DbStockMethods()
  const mailSenderAdapter = new MailSenderAdapter()
  return new OrderController(stockMethods, mailSenderAdapter)
}