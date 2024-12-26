import { OrderController } from '../../presentation/controllers/order-controller'


export function makeOrderController(): OrderController {
  return new OrderController()
}