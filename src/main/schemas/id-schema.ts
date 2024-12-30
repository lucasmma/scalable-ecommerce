import { z } from 'zod'

/**
 * @openapi
 * components:
 *   parameters:
 *     IdParameter:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *         example: "cl7xo5v8i0000zqox49d3knp6"
 */


export const idSchema = z.object({
  id: z.string().cuid()
}).strict();