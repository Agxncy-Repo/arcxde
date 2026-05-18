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
var HealthController_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.HealthController = void 0;
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
const common_1 = require('@nestjs/common');
const swagger_1 = require('@nestjs/swagger');
const prisma_service_js_1 = require('../prisma/prisma.service.js');
let HealthController = (HealthController_1 = class HealthController {
  constructor(prisma) {
    this.prisma = prisma;
    this.logger = new common_1.Logger(HealthController_1.name);
  }
  health() {
    return { status: 'ok', uptime: process.uptime() };
  }
  async ready() {
    try {
      await this.prisma.ping();
    } catch (error) {
      this.logger.warn({ err: error }, 'Readiness check failed: db');
      throw new common_1.ServiceUnavailableException({
        status: 'degraded',
        checks: { db: 'unreachable' },
      });
    }
    return { status: 'ok', checks: { db: 'ok' } };
  }
});
exports.HealthController = HealthController;
__decorate(
  [
    (0, common_1.Get)('health'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOkResponse)({ description: 'Process is alive.' }),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', Object),
  ],
  HealthController.prototype,
  'health',
  null,
);
__decorate(
  [
    (0, common_1.Get)('ready'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOkResponse)({ description: 'Dependencies are reachable.' }),
    (0, swagger_1.ApiServiceUnavailableResponse)({ description: 'A dependency is unreachable.' }),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', Promise),
  ],
  HealthController.prototype,
  'ready',
  null,
);
exports.HealthController =
  HealthController =
  HealthController_1 =
    __decorate(
      [
        (0, swagger_1.ApiTags)('health'),
        (0, common_1.Controller)(),
        __metadata('design:paramtypes', [prisma_service_js_1.PrismaService]),
      ],
      HealthController,
    );
//# sourceMappingURL=health.controller.js.map
