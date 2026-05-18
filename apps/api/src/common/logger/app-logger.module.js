'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return (c > 3 && r && Object.defineProperty(target, key, r), r);
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.AppLoggerModule = void 0;
/**
 * Pino logger configuration.
 *
 * - Structured JSON in production (parseable by Datadog/Loki/Sumo).
 * - Pretty colored in development (LOG_PRETTY=true).
 * - Auto-correlates each log line with the request ID via nestjs-pino.
 * - Redacts sensitive fields globally — additions to this list go in a PR
 *   reviewed by security.
 *
 * See docs/architecture/observability.md.
 */
const common_1 = require('@nestjs/common');
const nestjs_pino_1 = require('nestjs-pino');
const node_crypto_1 = require('node:crypto');
const app_config_module_js_1 = require('../config/app-config.module.js');
const app_config_service_js_1 = require('../config/app-config.service.js');
const REDACT_PATHS = [
  // Auth-bearing headers
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["set-cookie"]',
  'req.headers["x-api-key"]',
  // Common secret-shaped fields anywhere in the payload
  '*.password',
  '*.passwordHash',
  '*.token',
  '*.accessToken',
  '*.refreshToken',
  '*.apiKey',
  '*.secret',
  '*.privateKey',
];
let AppLoggerModule = class AppLoggerModule {};
exports.AppLoggerModule = AppLoggerModule;
exports.AppLoggerModule = AppLoggerModule = __decorate(
  [
    (0, common_1.Module)({
      imports: [
        nestjs_pino_1.LoggerModule.forRootAsync({
          imports: [app_config_module_js_1.AppConfigModule],
          inject: [app_config_service_js_1.AppConfigService],
          useFactory: (config) => ({
            pinoHttp: {
              level: config.logging.level,
              customProps: () => ({ service: config.observability.serviceName }),
              serializers: {
                req: (req) => ({
                  method: req.method,
                  url: req.url,
                  requestId: req.id,
                }),
                res: (res) => ({ statusCode: res.statusCode }),
              },
              customLogLevel: (_req, res, err) => {
                if (err || res.statusCode >= 500) return 'error';
                if (res.statusCode >= 400) return 'warn';
                return 'info';
              },
              redact: { paths: REDACT_PATHS, censor: '[REDACTED]' },
              genReqId: (req) => {
                const existing = req.id;
                return typeof existing === 'string' && existing.length > 0
                  ? existing
                  : (0, node_crypto_1.randomUUID)();
              },
              ...(config.logging.pretty
                ? {
                    transport: {
                      target: 'pino-pretty',
                      options: {
                        singleLine: true,
                        colorize: true,
                        translateTime: 'SYS:HH:MM:ss.l',
                        ignore: 'pid,hostname,service',
                      },
                    },
                  }
                : {}),
            },
          }),
        }),
      ],
      exports: [nestjs_pino_1.LoggerModule],
    }),
  ],
  AppLoggerModule,
);
//# sourceMappingURL=app-logger.module.js.map
