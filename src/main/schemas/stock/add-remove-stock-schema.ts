import { z } from 'zod'


export const addRemoveStockSchema = z.object({
  quantity: z.number().int()
})