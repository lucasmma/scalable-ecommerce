import { z } from 'zod'

export const payCartSchema = z.object({
  address: z.string(),
}).strict();
