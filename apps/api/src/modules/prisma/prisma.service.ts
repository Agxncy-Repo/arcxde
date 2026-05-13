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
import { Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { AppConfigService } from '../../common/config/app-config.service.js';

const SLOW_QUERY_MS = 250;

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(config: AppConfigService) {
    super({
      datasources: { db: { url: config.database.url } },
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
      errorFormat: config.isProduction ? 'minimal' : 'pretty',
    });

    // Route Prisma events into our structured logger. We avoid attaching listeners
    // when not needed because each one is a small perf cost on every query.
    // @ts-expect-error — Prisma's typed event API is awkward for query events
    this.$on('query', (e: { query: string; params: string; duration: number }) => {
      if (e.duration >= SLOW_QUERY_MS) {
        this.logger.warn(
          { duration: e.duration, query: e.query },
          `Slow query: ${e.duration}ms`,
        );
      }
    });

    // @ts-expect-error — same as above
    this.$on('warn', (e: { message: string }) => this.logger.warn(e.message));
    // @ts-expect-error — same as above
    this.$on('error', (e: { message: string }) => this.logger.error(e.message));
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  /**
   * Lightweight readiness probe — used by /ready to verify DB connectivity
   * without paying for a real query.
   */
  async ping(): Promise<void> {
    await this.$queryRaw`SELECT 1`;
  }
}
