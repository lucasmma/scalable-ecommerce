import { z } from 'zod'

/**
 * @openapi
 * components:
 *   schemas:
 *     EditUser:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "John Doe"
 *         email:
 *           type: string
 *           example: "johndoe@example.com"
 *         documentNumber:
 *           type: string
 *           example: "123456789"
 *       required: []
 *       additionalProperties: false
 *       description: |
 *         Schema for editing an existing user account.
 *         - `name`: Updated name of the user.
 *         - `email`: Updated email address of the user, must be a valid email format.
 *         - `documentNumber`: Updated document number (e.g., CPF) with exactly 9 characters.
 *       example:
 *         name: "John Doe"
 *         email: "johndoe@example.com"
 *         documentNumber: "123456789"
 */
export const editUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  documentNumber: z.string().length(9).optional(),
}).strict().refine((data) => {
  return Object.values(data).some((value) => value !== undefined); // Check if at least one value is not undefined
}, {
  message: 'At least one field must be provided',
});