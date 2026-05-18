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
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.AppConfigService = void 0;
/**
 * Typed configuration service.
 *
 * Inject this anywhere config is needed. Never read `process.env` directly in
 * application code — that bypasses Zod validation and creates "undefined sneaks
 * through everything" bugs.
 */
const common_1 = require('@nestjs/common');
let AppConfigService = class AppConfigService {
  constructor(env) {
    this.env = env;
  }
  // ---- Generic typed getter ----
  get(key) {
    return this.env[key];
  }
  // ---- Convenience accessors for things used in many places ----
  get isProduction() {
    return this.env.NODE_ENV === 'production';
  }
  get isDevelopment() {
    return this.env.NODE_ENV === 'development';
  }
  get isTest() {
    return this.env.NODE_ENV === 'test';
  }
  get http() {
    return {
      port: this.env.API_PORT,
      host: this.env.API_HOST,
      publicUrl: this.env.API_PUBLIC_URL,
      corsOrigins: this.env.CORS_ALLOWED_ORIGINS,
    };
  }
  get database() {
    return { url: this.env.DATABASE_URL };
  }
  get redis() {
    return { url: this.env.REDIS_URL };
  }
  get auth() {
    return {
      accessSecret: this.env.JWT_ACCESS_SECRET,
      refreshSecret: this.env.JWT_REFRESH_SECRET,
      accessTtl: this.env.JWT_ACCESS_TTL,
      refreshTtl: this.env.JWT_REFRESH_TTL,
    };
  }
  get logging() {
    return { level: this.env.LOG_LEVEL, pretty: this.env.LOG_PRETTY };
  }
  get rateLimits() {
    return {
      globalPerMin: this.env.RATE_LIMIT_GLOBAL_PER_MIN,
      authPerMin: this.env.RATE_LIMIT_AUTH_PER_MIN,
    };
  }
  get observability() {
    const otlp = this.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    const sentry = this.env.SENTRY_DSN;
    return {
      serviceName: this.env.OTEL_SERVICE_NAME,
      ...(otlp ? { otlpEndpoint: otlp } : {}),
      ...(sentry ? { sentryDsn: sentry } : {}),
    };
  }
};
exports.AppConfigService = AppConfigService;
exports.AppConfigService = AppConfigService = __decorate(
  [(0, common_1.Injectable)(), __metadata('design:paramtypes', [Object])],
  AppConfigService,
);
//# sourceMappingURL=app-config.service.js.map
