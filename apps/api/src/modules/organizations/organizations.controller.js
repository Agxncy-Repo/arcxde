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
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.OrganizationsController = void 0;
/**
 * OrganizationsController.
 *
 * Thin HTTP layer:
 *   - Validates inputs with @ZodBody / @ZodQuery / @ZodParam (single source of
 *     truth: @app/contracts).
 *   - Calls the service. Does NOT contain business logic.
 *   - Lets DomainError propagate; the global HttpExceptionFilter takes care
 *     of mapping to the envelope.
 *
 * Response shapes intentionally match the contract envelopes in
 * docs/conventions/api-design.md.
 */
const common_1 = require('@nestjs/common');
const swagger_1 = require('@nestjs/swagger');
const contracts_1 = require('@app/contracts');
const zod_decorators_js_1 = require('../../common/validation/zod.decorators.js');
const organizations_service_js_1 = require('./organizations.service.js');
let OrganizationsController = class OrganizationsController {
  constructor(service) {
    this.service = service;
  }
  async list(query) {
    return this.service.list(query);
  }
  async getOne(params) {
    return { data: await this.service.getById(params.id) };
  }
  async create(body) {
    return { data: await this.service.create(body) };
  }
  async update(params, body) {
    return { data: await this.service.update(params.id, body) };
  }
  async delete(params) {
    await this.service.delete(params.id);
  }
};
exports.OrganizationsController = OrganizationsController;
__decorate(
  [
    (0, common_1.Get)(),
    __param(0, (0, zod_decorators_js_1.ZodQuery)(contracts_1.paginationQuerySchema)),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', Promise),
  ],
  OrganizationsController.prototype,
  'list',
  null,
);
__decorate(
  [
    (0, common_1.Get)(':id'),
    __param(0, (0, zod_decorators_js_1.ZodParam)(contracts_1.organizationParamsSchema)),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', Promise),
  ],
  OrganizationsController.prototype,
  'getOne',
  null,
);
__decorate(
  [
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(201),
    __param(0, (0, zod_decorators_js_1.ZodBody)(contracts_1.createOrganizationBodySchema)),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', Promise),
  ],
  OrganizationsController.prototype,
  'create',
  null,
);
__decorate(
  [
    (0, common_1.Put)(':id'),
    __param(0, (0, zod_decorators_js_1.ZodParam)(contracts_1.organizationParamsSchema)),
    __param(1, (0, zod_decorators_js_1.ZodBody)(contracts_1.updateOrganizationBodySchema)),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object, Object]),
    __metadata('design:returntype', Promise),
  ],
  OrganizationsController.prototype,
  'update',
  null,
);
__decorate(
  [
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, zod_decorators_js_1.ZodParam)(contracts_1.organizationParamsSchema)),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', Promise),
  ],
  OrganizationsController.prototype,
  'delete',
  null,
);
exports.OrganizationsController = OrganizationsController = __decorate(
  [
    (0, swagger_1.ApiTags)('organizations'),
    (0, common_1.Controller)({ path: 'organizations', version: '1' }),
    __metadata('design:paramtypes', [organizations_service_js_1.OrganizationsService]),
  ],
  OrganizationsController,
);
//# sourceMappingURL=organizations.controller.js.map
