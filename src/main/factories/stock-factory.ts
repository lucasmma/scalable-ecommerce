import { DbStockMethods } from '../../data/usecases/db-stock-methods'
import { StockController } from '../../presentation/controllers/stock-controller'

export function makeStockController(): StockController {
  var stockMethods = new DbStockMethods()
  return new StockController(stockMethods)
}