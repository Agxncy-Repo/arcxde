/**
 * Shared primitives used across every domain schema.
 *
 * Keep this file small and stable. Anything domain-specific lives elsewhere.
 * See docs/conventions/api-design.md for the contracts these enforce.
 */
import { z } from 'zod';

/**
 * Prefixed CUIDs.
 * Format: <type-prefix>_<24+ alphanumeric chars>.
 * Examples: usr_clw3xj9k0000xqp8r2a8e3yfx, org_ckv8q7m9z0001hkp2d6n4y3jr.
 *
 * Why prefixes: makes IDs self-describing in logs, dashboards, and support tickets.
 */
export const idSchema = (prefix: string) =>
  z
    .string()
    .min(prefix.length + 1)
    .regex(new RegExp(`^${prefix}_[a-z0-9]{20,}$`), {
      message: `Expected ID with prefix "${prefix}_"`,
    });

/**
 * ISO-8601 timestamp (with timezone).
 * We never accept naive datetimes from the wire.
 */
export const isoDateTimeSchema = z.string().datetime({ offset: true });

/**
 * Email — RFC 5321 max length, lowercased on parse to prevent duplicate accounts.
 */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email()
  .max(254, 'Email exceeds maximum length');

/**
 * Cursor pagination request.
 * Cursors are opaque base64 strings issued by the server.
 */
export const paginationQuerySchema = z.object({
  cursor: z.string().min(1).max(256).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

/**
 * Pagination metadata returned with every list response.
 */
export const paginationMetaSchema = z.object({
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
  limit: z.number().int().min(1).max(100),
});
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

/**
 * Standard list response envelope. Generic over the item schema.
 */
export const listResponseSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    data: z.array(item),
    pagination: paginationMetaSchema,
  });

/**
 * Standard error envelope.
 *
 * `code` is machine-readable (UPPER_SNAKE_CASE), `message` is human-readable but
 * NEVER user-facing — clients translate codes to user copy. See api-design.md.
 */
export const errorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string().regex(/^[A-Z][A-Z0-9_]+$/),
    message: z.string(),
    requestId: z.string(),
    details: z.unknown().optional(),
  }),
});
export type ErrorEnvelope = z.infer<typeof errorEnvelopeSchema>;
