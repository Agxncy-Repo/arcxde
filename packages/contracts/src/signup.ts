import { z } from 'zod';
import { emailSchema } from './common.js';
import { createOrganizationBodySchema } from './organizations.js';
import { passwordSchema } from './auth.js';

// ============================================================================
// 1. Live Domain Verification
// ============================================================================
export const verifyDomainQuerySchema = z.object({
  email: emailSchema,
});
export type VerifyDomainQuery = z.infer<typeof verifyDomainQuerySchema>;

export const verifyDomainResponseSchema = z.object({
  exists: z.boolean(),
});
export type VerifyDomainResponse = z.infer<typeof verifyDomainResponseSchema>;

// ============================================================================
// 2. Progressive Onboarding & OTP Flows
// ============================================================================

// Phase 1: POST /signup/email
export const emailInitiateSchema = z.object({
  email: emailSchema,
});
export type EmailInitiateSchema = z.infer<typeof emailInitiateSchema>;

// Phase 2: POST /signup/verify
export const verifyLinkSchema = z.object({
  token: z
    .string()
    .min(1, 'Verification token is required')
    // Assumes 32 random bytes converted to hex = 64 characters long
    .regex(/^[a-fA-F0-9]{64}$/, 'Invalid verification token format'),
});
export type VerifyLinkDto = z.infer<typeof verifyLinkSchema>;

// Phase 3: POST /signup/password
export const passwordSignupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
export type PasswordSignupSchema = z.infer<typeof passwordSignupSchema>;

// ============================================================================
// 3. Individual Signup (Legacy/Alternative)
// ============================================================================
export const individualSignupBodySchema = z.object({
  email: emailSchema,
  firstName: z.string().trim().optional(),
  lastName: z.string().trim().optional(),
});
export type IndividualSignupBody = z.infer<typeof individualSignupBodySchema>;

// ============================================================================
// 4. Organization Signup
// ============================================================================
export const organizationSignupBodySchema = z.object({
  email: emailSchema,
  firstName: z.string().trim().optional(),
  lastName: z.string().trim().optional(),
  organization: createOrganizationBodySchema.extend({
    allowedDomains: z.array(z.string()).default([]),
    orgSize: z.enum(['1-10', '11-50', '51-200', '201+']),
    industry: z.enum(['FINANCE', 'TECHNOLOGY', 'HEALTHCARE', 'OTHER']),
    aiUsage: z.enum(['DEPLOYER', 'PROVIDER', 'NONE']),
  }),
});
export type OrganizationSignupBody = z.infer<typeof organizationSignupBodySchema>;
