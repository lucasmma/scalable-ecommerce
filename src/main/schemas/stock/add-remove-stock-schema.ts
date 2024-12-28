import { z } from 'zod'


export const addRemoveStockSchema = z.object({
  productId: z.string(),
  quantity: z.number().int()
})