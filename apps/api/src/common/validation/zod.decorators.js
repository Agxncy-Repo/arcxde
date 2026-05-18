'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ZodParam = exports.ZodQuery = exports.ZodBody = void 0;
/**
 * Param decorators that bind a Zod schema in a single annotation.
 *
 *   @Post()
 *   create(@ZodBody(createOrganizationBodySchema) body: CreateOrganizationBody) { ... }
 *
 *   @Get(':id')
 *   getOne(@ZodParam(organizationParamsSchema) params: OrganizationParams) { ... }
 *
 *   @Get()
 *   list(@ZodQuery(paginationQuerySchema) q: PaginationQuery) { ... }
 *
 * Prefer these over the raw pipe — they remove the `new ZodValidationPipe(...)` noise
 * from every controller method.
 */
const common_1 = require('@nestjs/common');
const zod_validation_pipe_js_1 = require('./zod-validation.pipe.js');
const ZodBody = (schema) =>
  (0, common_1.Body)(new zod_validation_pipe_js_1.ZodValidationPipe(schema));
exports.ZodBody = ZodBody;
const ZodQuery = (schema) =>
  (0, common_1.Query)(new zod_validation_pipe_js_1.ZodValidationPipe(schema));
exports.ZodQuery = ZodQuery;
const ZodParam = (schema) =>
  (0, common_1.Param)(new zod_validation_pipe_js_1.ZodValidationPipe(schema));
exports.ZodParam = ZodParam;
//# sourceMappingURL=zod.decorators.js.map
