/**
 * Health endpoints.
 *
 *  /health  — Liveness. Returns 200 if the process is up. NEVER touches dependencies.
 *             Used by the container runtime to decide whether to restart the pod.
 *
 *  /ready   — Readiness. Verifies DB connectivity. Returns 503 when degraded.
 *             Used by load balancers to decide whether to send traffic.
 *
 * Why split: a DB blip should not cause a restart loop. The pod is still alive
 * and might recover on its own; we just want to take it out of rotation.
 *
 * See docs/architecture/observability.md "Health endpoints".
 */
import { Controller, Get, HttpCode, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ApiOkResponse, ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';

import { PrismaService } from '../prisma/prisma.service.js';

@ApiTags('health')
@Controller()
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  @HttpCode(200)
  @ApiOkResponse({ description: 'Process is alive.' })
  health(): { status: 'ok'; uptime: number } {
    return { status: 'ok', uptime: process.uptime() };
  }

  @Get('ready')
  @HttpCode(200)
  @ApiOkResponse({ description: 'Dependencies are reachable.' })
  @ApiServiceUnavailableResponse({ description: 'A dependency is unreachable.' })
  async ready(): Promise<{ status: 'ok'; checks: { db: 'ok' } }> {
    try {
      await this.prisma.ping();
    } catch (error) {
      this.logger.warn({ err: error }, 'Readiness check failed: db');
      throw new ServiceUnavailableException({
        status: 'degraded',
        checks: { db: 'unreachable' },
      });
    }
    return { status: 'ok', checks: { db: 'ok' } };
  }
}
