import { z } from 'zod';
import { emailSchema } from './common.js';
import { createOrganizationBodySchema } from './organizations.js';

// 1. Live Domain Verification
export const verifyDomainQuerySchema = z.object({
  email: emailSchema,
});
export type VerifyDomainQuery = z.infer<typeof verifyDomainQuerySchema>;

export const verifyDomainResponseSchema = z.object({
  exists: z.boolean(),
});
export type VerifyDomainResponse = z.infer<typeof verifyDomainResponseSchema>;

// 2. Individual Signup
export const individualSignupBodySchema = z.object({
  email: emailSchema,
  firstName: z.string().trim().optional(),
  lastName: z.string().trim().optional(),
});
export type IndividualSignupBody = z.infer<typeof individualSignupBodySchema>;

// 3. Organization Signup
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
