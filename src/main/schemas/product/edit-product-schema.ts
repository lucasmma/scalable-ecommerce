import { z } from 'zod'

export const editProductSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.number().int().optional(),
  categoryId: z.string().optional(),
}).strict().refine((data) => {
  return Object.values(data).some((value) => value !== undefined); // Check if at least one value is not undefined
}, {
  message: 'At least one field must be provided',
});