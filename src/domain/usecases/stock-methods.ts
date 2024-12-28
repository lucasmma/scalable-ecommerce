import { Stock } from '@prisma/client'

export interface StockMethods {
  add: (productId: string, quantity: number) => Promise<Stock>
  remove: (productId: string, quantity: number) => Promise<Stock>
  validateStock: (productId: string) => Promise<boolean>
}