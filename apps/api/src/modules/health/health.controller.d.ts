import { PrismaService } from '../prisma/prisma.service.js';
export declare class HealthController {
  private readonly prisma;
  private readonly logger;
  constructor(prisma: PrismaService);
  health(): {
    status: 'ok';
    uptime: number;
  };
  ready(): Promise<{
    status: 'ok';
    checks: {
      db: 'ok';
    };
  }>;
}
//# sourceMappingURL=health.controller.d.ts.map
