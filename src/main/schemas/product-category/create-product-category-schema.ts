import { z } from 'zod'

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateProductCategory:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Electronics"
 */


export const createProductCategorySchema = z.object({
  name: z.string(),
}).strict();