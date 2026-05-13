/**
 * Application entry point.
 *
 * Responsibilities, in order:
 *   1. Validate environment BEFORE Nest boots. Misconfig → exit 1, fast.
 *   2. Bootstrap Nest with the Fastify adapter (ADR-0003).
 *   3. Install global cross-cutting concerns: request-id, cors, helmet, compression,
 *      cookies, exception filter, URI versioning, Swagger.
 *   4. Listen.
 *   5. Wire graceful-shutdown signals so deploys don't drop in-flight requests.
 *
 * See:
 *   - docs/architecture/backend.md → bootstrap order
 *   - docs/operations/deployment.md → graceful shutdown
 *   - docs/architecture/security.md → headers, CORS
 */
import compress from '@fastify/compress';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger as PinoLogger } from 'nestjs-pino';

import { AppModule } from './app.module.js';
import { AppConfigService } from './common/config/app-config.service.js';
import { parseEnv } from './common/config/env.schema.js';
import { HttpExceptionFilter } from './common/errors/http-exception.filter.js';
import { registerRequestIdHook } from './common/middleware/request-id.hook.js';

const SHUTDOWN_TIMEOUT_MS = 30_000;

async function bootstrap(): Promise<void> {
  // ---- 1. Env validation FIRST. Crash early if invalid. ----
  // We call parseEnv twice (here + inside AppConfigModule) deliberately: this
  // call surfaces a clean error before Nest gets involved with its own logging.
  parseEnv(process.env);

  // ---- 2. Build the Fastify adapter ----
  const fastify = new FastifyAdapter({
    // Trust X-Forwarded-* from the LB; required for correct rate-limiting and HTTPS detection
    trustProxy: true,
    // Generate a stable request id; replaced by registerRequestIdHook if header present
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'requestId',
    // Cap body size; oversize uploads go through a separate signed-URL path
    bodyLimit: 1_048_576, // 1 MiB
    // Disable Fastify's own logger — Pino via nestjs-pino handles HTTP logging
    logger: false,
  });
  registerRequestIdHook(fastify.getInstance());

  // ---- 3. Bootstrap Nest ----
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, fastify, {
    bufferLogs: true,
  });
  app.useLogger(app.get(PinoLogger));

  const config = app.get(AppConfigService);
  const logger = new Logger('Bootstrap');

  // ---- 4. Global concerns ----
  // Body parsers come built-in with Fastify; we wire only the extras.

  // Security headers (CSP defaults are conservative; loosen per route via metadata only)
  await app.register(helmet, {
    contentSecurityPolicy: config.isProduction ? undefined : false,
    crossOriginEmbedderPolicy: false,
  });

  await app.register(compress, { encodings: ['gzip', 'deflate'] });

  await app.register(cookie, {
    // Secret used to sign cookies that need integrity (CSRF token, etc.).
    // Auth cookies are HTTP-only and don't rely on signing.
    secret: config.auth.accessSecret,
    parseOptions: { signed: false },
  });

  await app.register(cors, {
    origin: (origin, cb) => {
      const allowed = config.http.corsOrigins;
      // No Origin header (server-to-server, curl) → allow when not in prod
      if (!origin) {
        cb(null, !config.isProduction);
        return;
      }
      cb(null, allowed.includes(origin));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    maxAge: 86_400,
  });

  // URI versioning per ADR-0008: routes default to v1, opt out explicitly when needed.
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.setGlobalPrefix('api', { exclude: ['health', 'ready'] });

  // Fallback validation pipe (we mostly use @ZodBody, but if a route forgets, this still applies).
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  // OpenAPI (Swagger) — disabled in production by default. Enable behind auth for ops.
  if (!config.isProduction) {
    const swagger = new DocumentBuilder()
      .setTitle('arcxde API')
      .setDescription('See docs/conventions/api-design.md for the contract.')
      .setVersion('1.0')
      .addBearerAuth()
      .addCookieAuth('access_token')
      .build();
    const doc = SwaggerModule.createDocument(app, swagger);
    SwaggerModule.setup('docs', app, doc, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  // ---- 5. Graceful shutdown ----
  // Nest emits onModuleDestroy on SIGTERM/SIGINT when this is enabled.
  app.enableShutdownHooks();

  // ---- 6. Listen ----
  const { port, host } = config.http;
  await app.listen({ port, host });

  logger.log(`API listening on http://${host}:${port}`);
  if (!config.isProduction) {
    logger.log(`Swagger UI: http://${host}:${port}/docs`);
  }

  // Belt-and-braces shutdown: if Nest's own hook hangs, force-exit so the
  // orchestrator doesn't have to SIGKILL us.
  const onTerm = (signal: NodeJS.Signals): void => {
    logger.log(`Received ${signal}, draining...`);
    const timer = setTimeout(() => {
      logger.error('Shutdown timed out, forcing exit');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    timer.unref();
    void app.close().then(() => {
      logger.log('Closed cleanly');
      process.exit(0);
    });
  };
  process.once('SIGTERM', onTerm);
  process.once('SIGINT', onTerm);
}

bootstrap().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error('Fatal bootstrap error:', error);
  process.exit(1);
});
