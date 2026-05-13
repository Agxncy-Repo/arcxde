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
import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { randomUUID } from 'node:crypto';

import { AppConfigModule } from '../config/app-config.module.js';
import { AppConfigService } from '../config/app-config.service.js';

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

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        pinoHttp: {
          level: config.logging.level,
          // Hand-pick the fields rendered for HTTP logs; the defaults are noisy.
          customProps: () => ({ service: config.observability.serviceName }),
          serializers: {
            // Compact request log: method + url + reqId
            req: (req: { method: string; url: string; id?: string; headers?: Record<string, string> }) => ({
              method: req.method,
              url: req.url,
              requestId: req.id,
            }),
            res: (res: { statusCode: number }) => ({ statusCode: res.statusCode }),
          },
          // 5xx → error, 4xx → warn, everything else info
          customLogLevel: (_req, res, err) => {
            if (err || res.statusCode >= 500) return 'error';
            if (res.statusCode >= 400) return 'warn';
            return 'info';
          },
          redact: { paths: REDACT_PATHS, censor: '[REDACTED]' },
          // Re-use the request id installed by registerRequestIdHook so
          // header / log / trace all use the SAME id.
          genReqId: (req) => {
            const existing = (req as { id?: string }).id;
            return typeof existing === 'string' && existing.length > 0 ? existing : randomUUID();
          },
          transport: config.logging.pretty
            ? {
                target: 'pino-pretty',
                options: {
                  singleLine: true,
                  colorize: true,
                  translateTime: 'SYS:HH:MM:ss.l',
                  ignore: 'pid,hostname,service',
                },
              }
            : undefined,
        },
      }),
    }),
  ],
  exports: [LoggerModule],
})
export class AppLoggerModule {}
