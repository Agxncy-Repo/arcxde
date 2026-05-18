'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.parseEnv = exports.envSchema = void 0;
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
const zod_1 = require('zod');
const nodeEnvSchema = zod_1.z.enum(['development', 'test', 'staging', 'production']);
const booleanFromString = zod_1.z
  .union([zod_1.z.boolean(), zod_1.z.enum(['true', 'false', '1', '0'])])
  .transform((v) => v === true || v === 'true' || v === '1');
const csvList = zod_1.z
  .string()
  .default('')
  .transform((v) =>
    v
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  );
exports.envSchema = zod_1.z
  .object({
    NODE_ENV: nodeEnvSchema.default('development'),
    // ---- HTTP ----
    API_PORT: zod_1.z.coerce.number().int().min(1).max(65535).default(3001),
    API_HOST: zod_1.z.string().default('0.0.0.0'),
    API_PUBLIC_URL: zod_1.z.string().url(),
    CORS_ALLOWED_ORIGINS: csvList,
    // ---- Database ----
    DATABASE_URL: zod_1.z.string().url().startsWith('postgresql://'),
    // ---- Redis ----
    REDIS_URL: zod_1.z.string().url().startsWith('redis://'),
    // ---- Auth ----
    JWT_ACCESS_SECRET: zod_1.z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 chars'),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 chars'),
    JWT_ACCESS_TTL: zod_1.z.string().default('15m'),
    JWT_REFRESH_TTL: zod_1.z.string().default('30d'),
    // ---- Logging ----
    LOG_LEVEL: zod_1.z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
    LOG_PRETTY: booleanFromString.default(false),
    // ---- Rate limiting ----
    RATE_LIMIT_GLOBAL_PER_MIN: zod_1.z.coerce.number().int().positive().default(600),
    RATE_LIMIT_AUTH_PER_MIN: zod_1.z.coerce.number().int().positive().default(20),
    // ---- Observability (optional in dev) ----
    OTEL_EXPORTER_OTLP_ENDPOINT: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    OTEL_SERVICE_NAME: zod_1.z.string().default('project-api'),
    SENTRY_DSN: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
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
/**
 * Parse and validate environment. Throws a formatted error listing every
 * problem at once — not one at a time. Called from main.ts before anything
 * else, so misconfigured pods fail visibly at startup.
 */
const parseEnv = (raw) => {
  const result = exports.envSchema.safeParse(raw);
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
exports.parseEnv = parseEnv;
//# sourceMappingURL=env.schema.js.map
