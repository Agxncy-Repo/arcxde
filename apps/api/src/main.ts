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
  parseEnv(process.env);

  const fastify = new FastifyAdapter({
    trustProxy: true,
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'requestId',
    bodyLimit: 1_048_576,
    logger: false,
  });
  registerRequestIdHook(fastify.getInstance());

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, fastify, {
    bufferLogs: true,
  });
  app.useLogger(app.get(PinoLogger));

  const config = app.get(AppConfigService);
  const logger = new Logger('Bootstrap');

  await app.register(helmet, {
    ...(config.isProduction
      ? {}
      : {
          contentSecurityPolicy: {
            directives: {
              defaultSrc: [`'self'`],
              styleSrc: [`'self'`, `'unsafe-inline'`],
              scriptSrc: [`'self'`, `'unsafe-inline'`, `'unsafe-eval'`],
              imgSrc: [`'self'`, 'data:', 'https:'],
              connectSrc: [`'self'`],
            },
          },
        }),
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
  });
  await app.register(cookie, {
    secret: config.auth.accessSecret,
    parseOptions: { signed: false },
  });

  await app.register(cors, {
    origin: (origin, cb) => {
      const allowed = config.http.corsOrigins;
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

  // ---- App-level config ----
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.setGlobalPrefix('api', { exclude: ['health', 'ready'] });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  if (!config.isProduction) {
    const swagger = new DocumentBuilder()
      .setTitle('arcxde API')
      .setDescription('See docs/conventions/api-design.md for the contract.')
      .setVersion('1.0')
      .addBearerAuth()
      .addCookieAuth('access_token')
      .build();

    const doc = SwaggerModule.createDocument(app, swagger);
    console.log('Routes in spec:', Object.keys(doc.paths || {}));

    SwaggerModule.setup('docs', app, doc, {
      useGlobalPrefix: false,
      jsonDocumentUrl: '/docs-json',
      swaggerOptions: { persistAuthorization: true },
    });
  }

  await app.register(compress, { encodings: ['gzip', 'deflate'] });

  app.enableShutdownHooks();

  const { port, host } = config.http;
  await app.listen({ port, host });

  logger.log(`API listening on http://${host}:${port}`);
  if (!config.isProduction) {
    logger.log(`Swagger UI: http://${host}:${port}/docs`);
  }

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
  console.error('Fatal bootstrap error:', error);
  process.exit(1);
});
