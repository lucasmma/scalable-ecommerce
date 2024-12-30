import { z } from 'zod'

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateProduct:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Product Name"
 *         description:
 *           type: string
 *           example: "A detailed description of the product."
 *         price:
 *           type: integer
 *           example: 1999
 *       required:
 *         - name
 *         - description
 *         - price
 *       additionalProperties: false
 *       description: |
 *         Schema for creating a new product.
 *         - `name`: Name of the product.
 *         - `description`: Description of the product.
 *         - `price`: Price of the product in cents.
 *       example:
 *         name: "Product Name"
 *         description: "A detailed description of the product."
 *         price: 1999
 */

export const createProductSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number().int(),
}).strict();