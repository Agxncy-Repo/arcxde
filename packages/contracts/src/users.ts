import { z } from 'zod';
import { passwordSchema } from './auth';

export const completeOnboardingSchema = z.object({
  // Add any questionnaire answers you want to store directly on the user here
  role: z.string().optional(),
  companyName: z.string().optional(),
});
export type CompleteOnboardingDto = z.infer<typeof completeOnboardingSchema>;

export const finalizeRegistrationSchema = z
  .object({
    token: z.string().min(1, 'Session token is required'),
    firstName: z.string().min(2, 'First name must be at least 2 characters').trim(),
    lastName: z.string().min(2, 'Last name must be at least 2 characters').trim(),
    password: passwordSchema, // Reuse the password validation from auth.ts
    confirmPassword: z.string().min(8, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'], // Highlights the confirm password field in the UI
  });

export type FinalizeRegistrationDto = z.infer<typeof finalizeRegistrationSchema>;
