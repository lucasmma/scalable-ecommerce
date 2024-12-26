import { z } from 'zod'


export const queryListProductCategorySchema = z.object({
  include_products: z.string()
    .transform((val) => val === 'true')
    .optional()
}).strict();