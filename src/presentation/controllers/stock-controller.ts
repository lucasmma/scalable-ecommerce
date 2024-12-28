import { StockMethods } from '../../domain/usecases/stock-methods'
import { idSchema } from '../../main/schemas/id-schema'
import { addRemoveStockSchema } from '../../main/schemas/stock/add-remove-stock-schema'
import { ok } from '../helpers/http-helper'
import { HttpRequest, HttpResponse } from '../protocols'

export class StockController {
  constructor(private readonly stockMethods: StockMethods) {
    this.stockMethods = stockMethods
  }

  async addStockFromProduct(request: HttpRequest<(typeof addRemoveStockSchema._output), (typeof idSchema._output)>): Promise<HttpResponse> {
    const body = request.body!
    const { id } = request.params!

    const stock = await this.stockMethods.add(id, body.quantity)

    return ok(stock)
  }

  async removeStockFromProduct(request: HttpRequest<(typeof addRemoveStockSchema._output), (typeof idSchema._output)>): Promise<HttpResponse> {
    const body = request.body!
    const { id } = request.params!

    const stock = await this.stockMethods.remove(id, body.quantity)

    return ok(stock)
  }


}