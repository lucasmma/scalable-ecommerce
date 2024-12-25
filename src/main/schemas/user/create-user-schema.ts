import { z } from 'zod'

export const createUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  document: z.string().length(9),
  password: z.string().min(6),
  passwordConfirmation: z.string().min(6)
})