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
exports.AppModule = void 0;
/**
 * Root application module.
 *
 * Wiring order matters: global modules (config, logger, prisma) before feature
 * modules so DI resolves cleanly. The order is alphabetized within each tier
 * to keep diffs small as features are added.
 */
const common_1 = require('@nestjs/common');
const nestjs_cls_1 = require('nestjs-cls');
const app_config_module_js_1 = require('./common/config/app-config.module.js');
const app_logger_module_js_1 = require('./common/logger/app-logger.module.js');
const health_module_js_1 = require('./modules/health/health.module.js');
const organizations_module_js_1 = require('./modules/organizations/organizations.module.js');
const prisma_module_js_1 = require('./modules/prisma/prisma.module.js');
let AppModule = class AppModule {};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate(
  [
    (0, common_1.Module)({
      imports: [
        // ---- Cross-cutting (global modules) ----
        app_config_module_js_1.AppConfigModule,
        app_logger_module_js_1.AppLoggerModule,
        // AsyncLocalStorage-backed request context. Available to any service that
        // needs the requestId or current user without threading them through args.
        nestjs_cls_1.ClsModule.forRoot({
          global: true,
          middleware: { mount: false },
          // middleware: { mount: true,  setup: (cls, req: { id?: string }) => cls.set('requestId', req.id) },
        }),
        prisma_module_js_1.PrismaModule,
        // ---- Feature modules (one per bounded context) ----
        health_module_js_1.HealthModule,
        organizations_module_js_1.OrganizationsModule,
      ],
    }),
  ],
  AppModule,
);
//# sourceMappingURL=app.module.js.map
