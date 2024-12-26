import { z } from 'zod'


export const editProductCategorySchema = z.object({
  name: z.string(),
}).strict();