import { z } from 'zod';

export const completeOnboardingSchema = z.object({
  // Add any questionnaire answers you want to store directly on the user here
  role: z.string().optional(),
  companyName: z.string().optional(),
});
export type CompleteOnboardingDto = z.infer<typeof completeOnboardingSchema>;
