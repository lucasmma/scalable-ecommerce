import { Stock } from '@prisma/client'

export interface StockMethods {
  add: (productId: string, quantity: number) => Promise<Stock>
  remove: (productId: string, quantity: number) => Promise<Stock>
  consumeStock: (productsUsed: {
    productId: string
    quantity: number
  }[]) => Promise<boolean>
}