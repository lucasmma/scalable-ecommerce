import { z } from 'zod'

/**
 * @openapi
 * components:
 *   schemas:
 *     UpdateCartItems:
 *       type: object
 *       properties:
 *         addProducts:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 format: cuid
 *                 example: "cl7xo5v8i0000zqox49d3knp6"
 *               quantity:
 *                 type: integer
 *                 example: 2
 *         removeProducts:
 *           type: array
 *           items:
 *             type: string
 *             example: "cl7xo5v8i0000zqox49d3knp6"
 *       required: []
 *       additionalProperties: false
 *       description: |
 *         Schema for updating the cart items. 
 *         - `addProducts`: List of products to add with their quantities.
 *         - `removeProducts`: List of product IDs to remove from the cart.
 *       example:
 *         addProducts: 
 *           - productId: "abc123"
 *             quantity: 2
 *         removeProducts:
 *           - "abc123"
 */

export const updateCartItemsSchema = z.object({
  addProducts: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int(),
  })).optional(),
  removeProducts: z.array(z.string()).optional(),
}).strict().refine((data) => {
  return (data.addProducts !== undefined && data.addProducts.length > 0) || (data.removeProducts !== undefined && data.removeProducts.length > 0);
}, {
  message: 'At least one field must be provided',
});