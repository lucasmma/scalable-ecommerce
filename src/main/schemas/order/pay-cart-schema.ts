import { z } from 'zod'
/**
 * @openapi
 * components:
 *   schemas:
 *     PayCart:
 *       type: object
 *       properties:
 *         address:
 *           type: string
 *           example: "123 Main St, Springfield, IL"
 */

export const payCartSchema = z.object({
  address: z.string(),
}).strict();
