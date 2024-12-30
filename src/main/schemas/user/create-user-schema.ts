import { z } from 'zod'

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateUser:
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
 *         password:
 *           type: string
 *           example: "password123"
 *         passwordConfirmation:
 *           type: string
 *           example: "password123"
 *       required:
 *         - name
 *         - email
 *         - documentNumber
 *         - password
 *         - passwordConfirmation
 *       additionalProperties: false
 *       description: |
 *         Schema for creating a new user account.
 *         - `name`: Full name of the user.
 *         - `email`: Email address of the user, must be a valid email format.
 *         - `documentNumber`: A document number (e.g., CPF) with exactly 9 characters.
 *         - `password`: Password for the account, at least 6 characters.
 *         - `passwordConfirmation`: Confirmation of the password, must match `password`.
 *       example:
 *         name: "John Doe"
 *         email: "johndoe@example.com"
 *         documentNumber: "123456789"
 *         password: "password123"
 *         passwordConfirmation: "password123"
 */
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