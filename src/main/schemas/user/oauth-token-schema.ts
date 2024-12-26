import { z } from 'zod'

export const createUserSchema = z.object({
  grantType: z.enum(['clients_credentials', 'refresh_token']),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  refreshToken: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.grantType === 'clients_credentials') {
    if (!data.clientId) {
      ctx.addIssue({
        path: ['clientId'],
        message: 'clientId is required when grantType is "clients_credentials"',
        code: z.ZodIssueCode.custom,
      });
    }
    if (!data.clientSecret) {
      ctx.addIssue({
        path: ['clientSecret'],
        message: 'clientSecret is required when grantType is "clients_credentials"',
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