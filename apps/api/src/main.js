'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const compress_1 = __importDefault(require('@fastify/compress'));
const cookie_1 = __importDefault(require('@fastify/cookie'));
const cors_1 = __importDefault(require('@fastify/cors'));
const helmet_1 = __importDefault(require('@fastify/helmet'));
const common_1 = require('@nestjs/common');
const core_1 = require('@nestjs/core');
const platform_fastify_1 = require('@nestjs/platform-fastify');
const swagger_1 = require('@nestjs/swagger');
const nestjs_pino_1 = require('nestjs-pino');
const app_module_js_1 = require('./app.module.js');
const app_config_service_js_1 = require('./common/config/app-config.service.js');
const env_schema_js_1 = require('./common/config/env.schema.js');
const http_exception_filter_js_1 = require('./common/errors/http-exception.filter.js');
const request_id_hook_js_1 = require('./common/middleware/request-id.hook.js');
const SHUTDOWN_TIMEOUT_MS = 30_000;
async function bootstrap() {
  (0, env_schema_js_1.parseEnv)(process.env);
  const fastify = new platform_fastify_1.FastifyAdapter({
    trustProxy: true,
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'requestId',
    bodyLimit: 1_048_576,
    logger: false,
  });
  (0, request_id_hook_js_1.registerRequestIdHook)(fastify.getInstance());
  const app = await core_1.NestFactory.create(app_module_js_1.AppModule, fastify, {
    bufferLogs: true,
  });
  app.useLogger(app.get(nestjs_pino_1.Logger));
  const config = app.get(app_config_service_js_1.AppConfigService);
  const logger = new common_1.Logger('Bootstrap');
  await app.register(helmet_1.default, {
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
  await app.register(cookie_1.default, {
    secret: config.auth.accessSecret,
    parseOptions: { signed: false },
  });
  await app.register(cors_1.default, {
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
  app.enableVersioning({ type: common_1.VersioningType.URI, defaultVersion: '1' });
  app.setGlobalPrefix('api', { exclude: ['health', 'ready'] });
  app.useGlobalPipes(
    new common_1.ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );
  app.useGlobalFilters(new http_exception_filter_js_1.HttpExceptionFilter());
  if (!config.isProduction) {
    const swagger = new swagger_1.DocumentBuilder()
      .setTitle('arcxde API')
      .setDescription('See docs/conventions/api-design.md for the contract.')
      .setVersion('1.0')
      .addBearerAuth()
      .addCookieAuth('access_token')
      .build();
    const doc = swagger_1.SwaggerModule.createDocument(app, swagger);
    console.log('Routes in spec:', Object.keys(doc.paths || {}));
    swagger_1.SwaggerModule.setup('docs', app, doc, {
      useGlobalPrefix: false,
      jsonDocumentUrl: '/docs-json',
      swaggerOptions: { persistAuthorization: true },
    });
  }
  await app.register(compress_1.default, { encodings: ['gzip', 'deflate'] });
  app.enableShutdownHooks();
  const { port, host } = config.http;
  await app.listen({ port, host });
  logger.log(`API listening on http://${host}:${port}`);
  if (!config.isProduction) {
    logger.log(`Swagger UI: http://${host}:${port}/docs`);
  }
  const onTerm = (signal) => {
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
bootstrap().catch((error) => {
  console.error('Fatal bootstrap error:', error);
  process.exit(1);
});
//# sourceMappingURL=main.js.map
