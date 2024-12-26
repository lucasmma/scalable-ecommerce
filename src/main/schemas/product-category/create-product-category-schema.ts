import { z } from 'zod'

export const createProductCategorySchema = z.object({
  name: z.string(),
}).strict();