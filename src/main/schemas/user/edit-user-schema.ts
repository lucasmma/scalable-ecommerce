import { z } from 'zod'


export const editUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  documentNumber: z.string().length(9).optional(),
}).strict().refine((data) => {
  return Object.values(data).some((value) => value !== undefined); // Check if at least one value is not undefined
}, {
  message: 'At least one field must be provided',
});