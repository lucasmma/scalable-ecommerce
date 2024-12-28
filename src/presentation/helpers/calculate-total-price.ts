import { Product } from '@prisma/client'

type ProductWithRequiredPrice = Partial<Product> & { price: number };

export function calculateTotalPriceFromProducts(items: { product: ProductWithRequiredPrice, quantity: number }[]) {
  return items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0)
}