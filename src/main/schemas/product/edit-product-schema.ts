import { z } from 'zod'

/**
 * @openapi
 * components:
 *   schemas:
 *     EditProduct:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Updated Product Name"
 *         description:
 *           type: string
 *           example: "Updated product description."
 *         price:
 *           type: integer
 *           example: 2500
 *         categoryId:
 *           type: string
 *           example: "category123"
 *       required: []
 *       additionalProperties: false
 *       description: |
 *         Schema for editing an existing product.
 *         - `name`: Updated name of the product.
 *         - `description`: Updated description of the product.
 *         - `price`: Updated price of the product in cents.
 *         - `categoryId`: Updated category ID of the product.
 *       example:
 *         name: "Updated Product Name"
 *         description: "Updated product description."
 *         price: 2500
 *         categoryId: "category123"
 */

export const editProductSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.number().int().optional(),
  categoryId: z.string().optional(),
}).strict().refine((data) => {
  return Object.values(data).some((value) => value !== undefined); // Check if at least one value is not undefined
}, {
  message: 'At least one field must be provided',
});