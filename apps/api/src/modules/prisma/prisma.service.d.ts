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
import { type OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AppConfigService } from '../../common/config/app-config.service.js';
export declare class PrismaService extends PrismaClient implements OnModuleDestroy {
  private readonly logger;
  constructor(config: AppConfigService);
  onModuleDestroy(): Promise<void>;
  /**
   * Lightweight readiness probe — used by /ready to verify DB connectivity
   * without paying for a real query.
   */
  ping(): Promise<void>;
}
//# sourceMappingURL=prisma.service.d.ts.map
