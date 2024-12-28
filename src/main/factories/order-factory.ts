import { DbStockMethods } from '../../data/usecases/db-stock-methods'
import { OrderController } from '../../presentation/controllers/order-controller'


export function makeOrderController(): OrderController {
  const stockMethods = new DbStockMethods()
  return new OrderController(stockMethods)
}