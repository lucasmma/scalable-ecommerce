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
 *         documentNumber:
 *           type: string
 *           example: "123456789"
 *       required: []
 *       additionalProperties: false
 *       description: |
 *         Schema for editing an existing user account.
 *         - `name`: Updated name of the user.
 *         - `documentNumber`: Updated document number (e.g., CPF) with exactly 9 characters.
 *       example:
 *         name: "John Doe"
 *         documentNumber: "123456789"
 */
export const editUserSchema = z.object({
  name: z.string().optional(),
  documentNumber: z.string().length(9).optional(),
}).strict().refine((data) => {
  return Object.values(data).some((value) => value !== undefined); // Check if at least one value is not undefined
}, {
  message: 'At least one field must be provided',
});