import { z } from 'zod'

export const updateCartItemsSchema = z.object({
  addProducts: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int(),
  })).optional(),
  removeProducts: z.array(z.string()).optional(),
}).strict().refine((data) => {
  return (data.addProducts !== undefined && data.addProducts.length > 0) || (data.removeProducts !== undefined && data.removeProducts.length > 0);
}, {
  message: 'At least one field must be provided',
});