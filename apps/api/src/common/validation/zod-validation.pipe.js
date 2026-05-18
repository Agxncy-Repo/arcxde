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
exports.ZodValidationPipe = void 0;
/**
 * ZodValidationPipe — validates body/query/param using a Zod schema.
 *
 * Why not class-validator: ADR-0003. Short version: Zod schemas already exist
 * in @app/contracts as the single source of truth shared with the frontend.
 * Duplicating them as classes here would create drift.
 *
 * Usage:
 *
 *   @Post()
 *   create(@Body(new ZodValidationPipe(createOrganizationBodySchema)) body: CreateOrganizationBody) { ... }
 *
 * Or, more ergonomically, use the helper decorators in this file:
 *
 *   @Post()
 *   create(@ZodBody(createOrganizationBodySchema) body: CreateOrganizationBody) { ... }
 */
const common_1 = require('@nestjs/common');
const domain_error_js_1 = require('../errors/domain-error.js');
let ZodValidationPipe = class ZodValidationPipe {
  constructor(schema) {
    this.schema = schema;
  }
  transform(value, _metadata) {
    const result = this.schema.safeParse(value);
    if (result.success) {
      return result.data;
    }
    throw domain_error_js_1.DomainError.validation(
      'VALIDATION_FAILED',
      'Request validation failed',
      {
        details: {
          issues: result.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            code: issue.code,
            message: issue.message,
          })),
        },
        cause: result.error,
      },
    );
  }
};
exports.ZodValidationPipe = ZodValidationPipe;
exports.ZodValidationPipe = ZodValidationPipe = __decorate(
  [(0, common_1.Injectable)(), __metadata('design:paramtypes', [Function])],
  ZodValidationPipe,
);
//# sourceMappingURL=zod-validation.pipe.js.map
