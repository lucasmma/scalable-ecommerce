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
 *         card:
 *           type: object
 *           properties:
 *             cardNumber:
 *               type: string
 *               example: "4242424242424242"
 *               description: "16-digit card number"
 *               pattern: "^\\d{16}$"
 *             cardHolder:
 *               type: string
 *               example: "John Doe"
 *               description: "Name on the card"
 *             expirationDate:
 *               type: string
 *               example: "12/30"
 *               description: "Expiration date in MM/YY format"
 *               pattern: "^\\d{2}\\/\\d{2}$"
 *             cvv:
 *               type: string
 *               example: "123"
 *               description: "3-digit CVV code"
 *               pattern: "^\\d{3}$"
 */

const validateExpirationDate = (date: string): boolean => {
  const [month, year] = date.split('/').map(Number);
  if (!month || !year || month < 1 || month > 12) return false;
  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;
  return year > currentYear || (year === currentYear && month >= currentMonth);
};

export const payCartSchema = z.object({
  address: z.string(),
  card: z.object({
    cardNumber: z.string().length(16).regex(/^\d+$/),
    cardHolder: z.string(),
    expirationDate: z.string().regex(/^\d{2}\/\d{2}$/).refine(validateExpirationDate, {
      message: "Expiration date must be a valid future date in MM/YY format",
    }),
    cvv: z.string().length(3).regex(/^\d+$/),
  }),
}).strict();
