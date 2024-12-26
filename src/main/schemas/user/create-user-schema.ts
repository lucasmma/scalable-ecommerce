import { z } from 'zod'

export const createUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  documentNumber: z.string().length(9),
  password: z.string().min(6),
  passwordConfirmation: z.string().min(6)
}).strict().refine((data) => data.password === data.passwordConfirmation, {
  message: 'Passwords do not match',
  path: ['passwordConfirmation'], // Path should match the field you're validating
});