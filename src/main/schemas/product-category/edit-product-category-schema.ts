import { z } from 'zod'

/**
 * @openapi
 * components:
 *   schemas:
 *     EditProductCategory:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Electronics"
 */

export const editProductCategorySchema = z.object({
  name: z.string(),
}).strict();