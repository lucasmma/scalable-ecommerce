import { Stock } from '@prisma/client'
import { StockMethods } from '../../domain/usecases/stock-methods'
import prisma from '../../main/config/prisma'


export class DbStockMethods implements StockMethods {
  async add(productId: string, quantity: number): Promise<Stock> {
    // check if exists stock otherwise create
    const stock = await prisma.stock.upsert({
      where: { productId },
      update: { quantity: { increment: quantity } },
      create: { productId, quantity }
    })

    return stock
  }

  async remove(productId: string, quantity: number): Promise<Stock> {
    // check if exists stock otherwise create
    var stock = await prisma.stock.findUnique({
      where: { productId }
    })

    if (!stock) {
      throw new Error('Stock not found')
    }

    if (stock.quantity < quantity) {
      throw new Error('Insufficient stock')
    }

    stock = await prisma.stock.update({
      where: { productId },
      data: { quantity: { decrement: quantity } }
    })

    return stock
  }

  async validateStock(productId: string): Promise<boolean> {
    // Check if product has stock
  const stock = await prisma.stock.findFirst({
    where: { productId }
  })

    if (!stock || stock.quantity <= 0) {
      return false
    }
    return true
  }
}