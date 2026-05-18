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
var PrismaService_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.PrismaService = void 0;
/**
 * PrismaService.
 *
 * Owns the database connection lifecycle and exposes the Prisma client to the
 * rest of the app. Repositories inject this directly — there is no abstraction
 * layer on top of Prisma. See docs/architecture/backend.md "Layering".
 *
 * Notes:
 *   - We do NOT call $connect() eagerly; Prisma connects lazily on first query.
 *     This keeps boot fast and removes a class of "DB unreachable at start"
 *     CrashLoopBackOff issues. The /ready probe still verifies connectivity.
 *   - enableShutdownHooks() is called from main.ts via app.enableShutdownHooks(),
 *     not here — Prisma 5+ removed the beforeExit hook.
 *   - Slow-query logging is wired through Prisma's event emitter so it flows
 *     through Pino like every other log line.
 */
const common_1 = require('@nestjs/common');
const client_1 = require('@prisma/client');
const app_config_service_js_1 = require('../../common/config/app-config.service.js');
const SLOW_QUERY_MS = 250;
let PrismaService = (PrismaService_1 = class PrismaService extends client_1.PrismaClient {
  constructor(config) {
    super({
      datasources: { db: { url: config.database.url } },
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
      errorFormat: config.isProduction ? 'minimal' : 'pretty',
    });
    this.logger = new common_1.Logger(PrismaService_1.name);
    // Route Prisma events into our structured logger. We avoid attaching listeners
    // when not needed because each one is a small perf cost on every query.
    // @ts-expect-error — Prisma's typed event API is awkward for query events
    this.$on('query', (e) => {
      if (e.duration >= SLOW_QUERY_MS) {
        this.logger.warn({ duration: e.duration, query: e.query }, `Slow query: ${e.duration}ms`);
      }
    });
    // @ts-expect-error — same as above
    this.$on('warn', (e) => this.logger.warn(e.message));
    // @ts-expect-error — same as above
    this.$on('error', (e) => this.logger.error(e.message));
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
  /**
   * Lightweight readiness probe — used by /ready to verify DB connectivity
   * without paying for a real query.
   */
  async ping() {
    await this.$queryRaw`SELECT 1`;
  }
});
exports.PrismaService = PrismaService;
exports.PrismaService =
  PrismaService =
  PrismaService_1 =
    __decorate(
      [
        (0, common_1.Injectable)(),
        __metadata('design:paramtypes', [app_config_service_js_1.AppConfigService]),
      ],
      PrismaService,
    );
//# sourceMappingURL=prisma.service.js.map
