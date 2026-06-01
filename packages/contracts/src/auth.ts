import { z } from 'zod';
import { emailSchema } from './common.js'; //

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(100, 'Password is too long');

export const loginWithCredentialsSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const tokenRefreshSchema = z.object({
  refreshToken: z.string().trim().min(1, 'Refresh token is required.'),
});

export const testEmailSchema = z.object({
  email: emailSchema,
});

export type TestEmailSchema = z.infer<typeof testEmailSchema>;
export type LoginWithCredentialsBody = z.infer<typeof loginWithCredentialsSchema>;
export type TokenRefreshBody = z.infer<typeof tokenRefreshSchema>;
