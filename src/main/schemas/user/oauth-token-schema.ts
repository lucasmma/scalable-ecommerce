import { z } from 'zod'

/**
 * @openapi
 * components:
 *   schemas:
 *     OauthToken:
 *       type: object
 *       properties:
 *         grantType:
 *           type: string
 *           enum: [client_credentials, refresh_token]
 *           example: "client_credentials"
 *         email:
 *           type: string
 *           example: "user@example.com"
 *         password:
 *           type: string
 *           example: "password123"
 *         refreshToken:
 *           type: string
 *           example: "refresh_token_example"
 *       required:
 *         - grantType
 *       additionalProperties: false
 *       description: |
 *         Schema for handling OAuth token requests.
 *         - `grantType`: The type of token request, either `client_credentials` or `refresh_token`.
 *         - `email`: The user's email, required for `client_credentials` grant type.
 *         - `password`: The user's password, required for `client_credentials` grant type.
 *         - `refreshToken`: The refresh token, required for `refresh_token` grant type.
 *       example:
 *         grantType: "client_credentials"
 *         email: "user@example.com"
 *         password: "password123"
 */

export const oauthTokenSchema = z.object({
  grantType: z.enum(['client_credentials', 'refresh_token']),
  email: z.string().email().optional(),
  password: z.string().optional(),
  refreshToken: z.string().optional(),
}).strict().superRefine((data, ctx) => {
  if (data.grantType === 'client_credentials') {
    if (!data.email) {
      ctx.addIssue({
        path: ['email'],
        message: 'email is required when grantType is "client_credentials"',
        code: z.ZodIssueCode.custom,
      });
    }
    if (!data.password) {
      ctx.addIssue({
        path: ['password'],
        message: 'password is required when grantType is "client_credentials"',
        code: z.ZodIssueCode.custom,
      });
    }
  } else {
    if (!data.refreshToken) {
      ctx.addIssue({
        path: ['refreshToken'],
        message: 'refreshToken is required when grantType is "refresh_token"',
        code: z.ZodIssueCode.custom,
      });
    }
  }
});