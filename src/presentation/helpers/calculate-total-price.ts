import { Product } from '@prisma/client'

export function calculateTotalPriceFromProducts(items: { product: Product, quantity: number }[]) {
  return items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0)
}