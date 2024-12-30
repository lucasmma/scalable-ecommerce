import { z } from 'zod'

/**
 * @openapi
 * components:
 *   schemas:
 *     AddRemoveStock:
 *       type: object
 *       properties:
 *         quantity:
 *           type: integer
 *           example: 10
 *       required:
 *         - quantity
 *       additionalProperties: false
 *       description: |
 *         Schema for adding or removing stock for a product.
 *         - `quantity`: The number of items to add or remove from stock. A positive number indicates adding stock, and a negative number indicates removing stock.
 *       example:
 *         quantity: 10
 */
export const addRemoveStockSchema = z.object({
  quantity: z.number().int()
}).strict();