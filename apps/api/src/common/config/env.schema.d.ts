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
export declare const envSchema: z.ZodEffects<
  z.ZodEffects<
    z.ZodObject<
      {
        NODE_ENV: z.ZodDefault<z.ZodEnum<['development', 'test', 'staging', 'production']>>;
        API_PORT: z.ZodDefault<z.ZodNumber>;
        API_HOST: z.ZodDefault<z.ZodString>;
        API_PUBLIC_URL: z.ZodString;
        CORS_ALLOWED_ORIGINS: z.ZodEffects<z.ZodDefault<z.ZodString>, string[], string | undefined>;
        DATABASE_URL: z.ZodString;
        REDIS_URL: z.ZodString;
        JWT_ACCESS_SECRET: z.ZodString;
        JWT_REFRESH_SECRET: z.ZodString;
        JWT_ACCESS_TTL: z.ZodDefault<z.ZodString>;
        JWT_REFRESH_TTL: z.ZodDefault<z.ZodString>;
        LOG_LEVEL: z.ZodDefault<z.ZodEnum<['trace', 'debug', 'info', 'warn', 'error', 'fatal']>>;
        LOG_PRETTY: z.ZodDefault<
          z.ZodEffects<
            z.ZodUnion<[z.ZodBoolean, z.ZodEnum<['true', 'false', '1', '0']>]>,
            boolean,
            boolean | '0' | '1' | 'true' | 'false'
          >
        >;
        RATE_LIMIT_GLOBAL_PER_MIN: z.ZodDefault<z.ZodNumber>;
        RATE_LIMIT_AUTH_PER_MIN: z.ZodDefault<z.ZodNumber>;
        OTEL_EXPORTER_OTLP_ENDPOINT: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<''>]>;
        OTEL_SERVICE_NAME: z.ZodDefault<z.ZodString>;
        SENTRY_DSN: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<''>]>;
      },
      'strip',
      z.ZodTypeAny,
      {
        NODE_ENV: 'development' | 'test' | 'staging' | 'production';
        API_PORT: number;
        API_HOST: string;
        API_PUBLIC_URL: string;
        CORS_ALLOWED_ORIGINS: string[];
        DATABASE_URL: string;
        REDIS_URL: string;
        JWT_ACCESS_SECRET: string;
        JWT_REFRESH_SECRET: string;
        JWT_ACCESS_TTL: string;
        JWT_REFRESH_TTL: string;
        LOG_LEVEL: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
        LOG_PRETTY: boolean;
        RATE_LIMIT_GLOBAL_PER_MIN: number;
        RATE_LIMIT_AUTH_PER_MIN: number;
        OTEL_SERVICE_NAME: string;
        OTEL_EXPORTER_OTLP_ENDPOINT?: string | undefined;
        SENTRY_DSN?: string | undefined;
      },
      {
        API_PUBLIC_URL: string;
        DATABASE_URL: string;
        REDIS_URL: string;
        JWT_ACCESS_SECRET: string;
        JWT_REFRESH_SECRET: string;
        NODE_ENV?: 'development' | 'test' | 'staging' | 'production' | undefined;
        API_PORT?: number | undefined;
        API_HOST?: string | undefined;
        CORS_ALLOWED_ORIGINS?: string | undefined;
        JWT_ACCESS_TTL?: string | undefined;
        JWT_REFRESH_TTL?: string | undefined;
        LOG_LEVEL?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | undefined;
        LOG_PRETTY?: boolean | '0' | '1' | 'true' | 'false' | undefined;
        RATE_LIMIT_GLOBAL_PER_MIN?: number | undefined;
        RATE_LIMIT_AUTH_PER_MIN?: number | undefined;
        OTEL_EXPORTER_OTLP_ENDPOINT?: string | undefined;
        OTEL_SERVICE_NAME?: string | undefined;
        SENTRY_DSN?: string | undefined;
      }
    >,
    {
      NODE_ENV: 'development' | 'test' | 'staging' | 'production';
      API_PORT: number;
      API_HOST: string;
      API_PUBLIC_URL: string;
      CORS_ALLOWED_ORIGINS: string[];
      DATABASE_URL: string;
      REDIS_URL: string;
      JWT_ACCESS_SECRET: string;
      JWT_REFRESH_SECRET: string;
      JWT_ACCESS_TTL: string;
      JWT_REFRESH_TTL: string;
      LOG_LEVEL: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
      LOG_PRETTY: boolean;
      RATE_LIMIT_GLOBAL_PER_MIN: number;
      RATE_LIMIT_AUTH_PER_MIN: number;
      OTEL_SERVICE_NAME: string;
      OTEL_EXPORTER_OTLP_ENDPOINT?: string | undefined;
      SENTRY_DSN?: string | undefined;
    },
    {
      API_PUBLIC_URL: string;
      DATABASE_URL: string;
      REDIS_URL: string;
      JWT_ACCESS_SECRET: string;
      JWT_REFRESH_SECRET: string;
      NODE_ENV?: 'development' | 'test' | 'staging' | 'production' | undefined;
      API_PORT?: number | undefined;
      API_HOST?: string | undefined;
      CORS_ALLOWED_ORIGINS?: string | undefined;
      JWT_ACCESS_TTL?: string | undefined;
      JWT_REFRESH_TTL?: string | undefined;
      LOG_LEVEL?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | undefined;
      LOG_PRETTY?: boolean | '0' | '1' | 'true' | 'false' | undefined;
      RATE_LIMIT_GLOBAL_PER_MIN?: number | undefined;
      RATE_LIMIT_AUTH_PER_MIN?: number | undefined;
      OTEL_EXPORTER_OTLP_ENDPOINT?: string | undefined;
      OTEL_SERVICE_NAME?: string | undefined;
      SENTRY_DSN?: string | undefined;
    }
  >,
  {
    NODE_ENV: 'development' | 'test' | 'staging' | 'production';
    API_PORT: number;
    API_HOST: string;
    API_PUBLIC_URL: string;
    CORS_ALLOWED_ORIGINS: string[];
    DATABASE_URL: string;
    REDIS_URL: string;
    JWT_ACCESS_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_ACCESS_TTL: string;
    JWT_REFRESH_TTL: string;
    LOG_LEVEL: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
    LOG_PRETTY: boolean;
    RATE_LIMIT_GLOBAL_PER_MIN: number;
    RATE_LIMIT_AUTH_PER_MIN: number;
    OTEL_SERVICE_NAME: string;
    OTEL_EXPORTER_OTLP_ENDPOINT?: string | undefined;
    SENTRY_DSN?: string | undefined;
  },
  {
    API_PUBLIC_URL: string;
    DATABASE_URL: string;
    REDIS_URL: string;
    JWT_ACCESS_SECRET: string;
    JWT_REFRESH_SECRET: string;
    NODE_ENV?: 'development' | 'test' | 'staging' | 'production' | undefined;
    API_PORT?: number | undefined;
    API_HOST?: string | undefined;
    CORS_ALLOWED_ORIGINS?: string | undefined;
    JWT_ACCESS_TTL?: string | undefined;
    JWT_REFRESH_TTL?: string | undefined;
    LOG_LEVEL?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | undefined;
    LOG_PRETTY?: boolean | '0' | '1' | 'true' | 'false' | undefined;
    RATE_LIMIT_GLOBAL_PER_MIN?: number | undefined;
    RATE_LIMIT_AUTH_PER_MIN?: number | undefined;
    OTEL_EXPORTER_OTLP_ENDPOINT?: string | undefined;
    OTEL_SERVICE_NAME?: string | undefined;
    SENTRY_DSN?: string | undefined;
  }
>;
export type Env = z.infer<typeof envSchema>;
/**
 * Parse and validate environment. Throws a formatted error listing every
 * problem at once — not one at a time. Called from main.ts before anything
 * else, so misconfigured pods fail visibly at startup.
 */
export declare const parseEnv: (raw: NodeJS.ProcessEnv) => Env;
//# sourceMappingURL=env.schema.d.ts.map
