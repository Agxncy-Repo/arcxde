/**
 * Environment configuration — Zod-validated at boot.
 *
 * The contract here:
 *   1. Every env var the app uses is declared in this schema.
 *   2. The process REFUSES TO START if anything is missing or malformed.
 *   3. Runtime code consumes this via ConfigService — never `process.env` directly.
 *
 * This is one of the highest-leverage decisions in the codebase: failures are
 * pushed from "user reports 500 on Tuesday" to "container CrashLoopBackOff at deploy."
 * See docs/operations/deployment.md.
 */
import { z } from 'zod';

const nodeEnvSchema = z.enum(['development', 'test', 'staging', 'production']);

const booleanFromString = z
  .union([z.boolean(), z.enum(['true', 'false', '1', '0'])])
  .transform((v) => v === true || v === 'true' || v === '1');

const csvList = z
  .string()
  .default('')
  .transform((v) =>
    v
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  );

export const envSchema = z
  .object({
    NODE_ENV: nodeEnvSchema.default('development'),

    // ---- HTTP ----
    API_PORT: z.coerce.number().int().min(1).max(65535).default(3001),
    API_HOST: z.string().default('0.0.0.0'),
    API_PUBLIC_URL: z.string().url(),
    CORS_ALLOWED_ORIGINS: csvList,

    // ---- Database ----
    DATABASE_URL: z.string().url().startsWith('postgresql://'),

    // ---- Redis ----
    REDIS_URL: z.string().url().startsWith('redis://'),

    // ---- Auth ----
    JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 chars'),
    JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 chars'),
    JWT_ACCESS_TTL: z.string().default('15m'),
    JWT_REFRESH_TTL: z.string().default('30d'),

    // ---- Logging ----
    LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
    LOG_PRETTY: booleanFromString.default(false),

    // ---- Rate limiting ----
    RATE_LIMIT_GLOBAL_PER_MIN: z.coerce.number().int().positive().default(600),
    RATE_LIMIT_AUTH_PER_MIN: z.coerce.number().int().positive().default(20),

    // ---- Observability (optional in dev) ----
    OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional().or(z.literal('')),
    OTEL_SERVICE_NAME: z.string().default('project-api'),
    SENTRY_DSN: z.string().url().optional().or(z.literal('')),
  })
  // Cross-field rule: the two JWT secrets must differ. Re-using one for both is a
  // common copy-paste mistake that defeats refresh-token rotation.
  .refine((env) => env.JWT_ACCESS_SECRET !== env.JWT_REFRESH_SECRET, {
    message: 'JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different values',
    path: ['JWT_REFRESH_SECRET'],
  })
  // In prod, pretty logging is a footgun (unstructured, slow, no parsing).
  .refine((env) => !(env.NODE_ENV === 'production' && env.LOG_PRETTY), {
    message: 'LOG_PRETTY must be false in production',
    path: ['LOG_PRETTY'],
  });

export type Env = z.infer<typeof envSchema>;

/**
 * Parse and validate environment. Throws a formatted error listing every
 * problem at once — not one at a time. Called from main.ts before anything
 * else, so misconfigured pods fail visibly at startup.
 */
export const parseEnv = (raw: NodeJS.ProcessEnv): Env => {
  const result = envSchema.safeParse(raw);
  if (result.success) {
    return result.data;
  }
  const issues = result.error.issues
    .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n');
  throw new Error(
    `Environment validation failed:\n${issues}\n\n` +
      `See apps/api/.env.example for the required shape.`,
  );
};
