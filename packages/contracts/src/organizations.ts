/**
 * Organization domain contracts.
 *
 * Single source of truth — the API validates inbound requests with these schemas,
 * the web app uses the same schemas in react-hook-form, and both sides share the
 * inferred TypeScript types.
 */
import { z } from 'zod';

import { emailSchema, idSchema, isoDateTimeSchema } from './common.js';

// ---- ID brands ----
export const organizationIdSchema = idSchema('org');
export type OrganizationId = z.infer<typeof organizationIdSchema>;

// ---- Domain enums ----
export const organizationPlanSchema = z.enum(['free', 'starter', 'growth', 'enterprise']);
export type OrganizationPlan = z.infer<typeof organizationPlanSchema>;

// ---- Core entity (response shape) ----
export const organizationSchema = z.object({
  id: organizationIdSchema,
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, 'lowercase letters, digits, and hyphens only'),
  plan: organizationPlanSchema,
  billingEmail: emailSchema.nullable(),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});
export type Organization = z.infer<typeof organizationSchema>;

// ---- Create ----
export const createOrganizationBodySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  slug: organizationSchema.shape.slug,
  billingEmail: emailSchema.optional(),
});
export type CreateOrganizationBody = z.infer<typeof createOrganizationBodySchema>;

// ---- Update ----
export const updateOrganizationBodySchema = createOrganizationBodySchema
  .partial()
  .refine((body) => Object.keys(body).length > 0, {
    message: 'At least one field must be provided',
  });
export type UpdateOrganizationBody = z.infer<typeof updateOrganizationBodySchema>;

// ---- Path parameters ----
export const organizationParamsSchema = z.object({
  id: organizationIdSchema,
});
export type OrganizationParams = z.infer<typeof organizationParamsSchema>;
