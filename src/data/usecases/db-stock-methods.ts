import { Stock } from '@prisma/client'
import { StockMethods } from '../../domain/usecases/stock-methods'
import prisma from '../../main/config/prisma'


export class DbStockMethods implements StockMethods {
  async add(productId: string, quantity: number): Promise<Stock> {
    // check if exists stock otherwise create
    const productValidation = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!productValidation) {
      throw new Error('Product not found')
    }

    const stock = await prisma.stock.upsert({
      where: { productId },
      update: { quantity: { increment: quantity } },
      create: { productId, quantity }
    })

    return stock
  }

  async remove(productId: string, quantity: number): Promise<Stock> {
    // check if exists stock otherwise create
    const productValidation = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!productValidation) {
      throw new Error('Product not found')
    }

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

  async consumeStock(productsUsed: {
    productId: string
    quantity: number
  }[]): Promise<boolean> {
    // Check if product has stock
    const stock = await prisma.stock.findMany({
      where: { productId: { in: productsUsed.map((p) => p.productId) } }
    })

    for (const product of productsUsed) {
      const productStock = stock.find((s) => s.productId === product.productId)
      if (!productStock || productStock.quantity < product.quantity) {
        return false
      }
    }

    // Update stock
    for (const product of productsUsed) {
      await prisma.stock.update({
        where: { productId: product.productId },
        data: { quantity: { decrement: product.quantity } }
      })
    }

    return true
  }
  
}