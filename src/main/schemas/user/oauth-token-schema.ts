import { z } from 'zod'

export const oauthTokenSchema = z.object({
  grantType: z.enum(['clients_credentials', 'refresh_token']),
  email: z.string().optional(),
  password: z.string().optional(),
  refreshToken: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.grantType === 'clients_credentials') {
    if (!data.email) {
      ctx.addIssue({
        path: ['email'],
        message: 'email is required when grantType is "clients_credentials"',
        code: z.ZodIssueCode.custom,
      });
    }
    if (!data.password) {
      ctx.addIssue({
        path: ['password'],
        message: 'password is required when grantType is "clients_credentials"',
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