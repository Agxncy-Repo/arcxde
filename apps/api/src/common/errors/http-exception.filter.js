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
var HttpExceptionFilter_1;
Object.defineProperty(exports, '__esModule', { value: true });
exports.DomainError = exports.HttpExceptionFilter = void 0;
/**
 * Global HTTP exception filter.
 *
 * Maps every error thrown by the application — DomainError, NestJS built-ins,
 * Prisma errors, totally unexpected ones — to the standard error envelope
 * defined in docs/conventions/api-design.md.
 *
 * Logging strategy:
 *   - 5xx: logged at error level with full stack and cause chain.
 *   - 4xx: logged at warn (debug in prod) — they're noise, not signals.
 *   - DomainError details are passed through to the client (no leakage of
 *     internals, since DomainError.details is opinionated by the throwing
 *     code).
 */
const common_1 = require('@nestjs/common');
const zod_1 = require('zod');
const domain_error_js_1 = require('./domain-error.js');
Object.defineProperty(exports, 'DomainError', {
  enumerable: true,
  get: function () {
    return domain_error_js_1.DomainError;
  },
});
let HttpExceptionFilter = (HttpExceptionFilter_1 = class HttpExceptionFilter {
  constructor() {
    this.logger = new common_1.Logger(HttpExceptionFilter_1.name);
  }
  catch(exception, host) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse();
    const request = ctx.getRequest();
    const requestId = request.headers['x-request-id'] ?? request.id;
    const payload = this.toPayload(exception);
    // 5xx → error log with stack; 4xx → debug only (don't pollute on user errors).
    if (payload.status >= 500) {
      this.logger.error(
        {
          err: this.serializeError(exception),
          requestId,
          method: request.method,
          url: request.url,
          status: payload.status,
          code: payload.code,
        },
        `Request failed: ${payload.code}`,
      );
    } else {
      this.logger.debug(
        {
          requestId,
          method: request.method,
          url: request.url,
          status: payload.status,
          code: payload.code,
        },
        `Client error: ${payload.code}`,
      );
    }
    void reply.status(payload.status).send({
      error: {
        code: payload.code,
        message: payload.message,
        requestId,
        ...(payload.details !== undefined ? { details: payload.details } : {}),
      },
    });
  }
  // -------- Mapping --------
  toPayload(exception) {
    if ((0, domain_error_js_1.isDomainError)(exception)) {
      return {
        status: exception.httpStatus,
        code: exception.code,
        message: exception.message,
        details: exception.details,
      };
    }
    if (exception instanceof zod_1.ZodError) {
      // Validation failures that escaped a pipe still get the standard treatment.
      return {
        status: 422,
        code: 'VALIDATION_FAILED',
        message: 'Request validation failed',
        details: {
          issues: exception.issues.map((i) => ({
            path: i.path.join('.'),
            code: i.code,
            message: i.message,
          })),
        },
      };
    }
    if (exception instanceof common_1.HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      const message =
        typeof response === 'string' ? response : (response.message ?? exception.message);
      return {
        status,
        code: this.statusToCode(status),
        message,
      };
    }
    // Catch-all: unexpected error. Never leak internals.
    return {
      status: 500,
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    };
  }
  statusToCode(status) {
    if (status === 400) return 'BAD_REQUEST';
    if (status === 401) return 'UNAUTHENTICATED';
    if (status === 403) return 'FORBIDDEN';
    if (status === 404) return 'NOT_FOUND';
    if (status === 409) return 'CONFLICT';
    if (status === 412) return 'PRECONDITION_FAILED';
    if (status === 422) return 'VALIDATION_FAILED';
    if (status === 429) return 'RATE_LIMITED';
    if (status >= 500) return 'INTERNAL_ERROR';
    return 'ERROR';
  }
  serializeError(exception) {
    if (exception instanceof Error) {
      return {
        name: exception.name,
        message: exception.message,
        stack: exception.stack,
        ...(exception.cause ? { cause: this.serializeError(exception.cause) } : {}),
        ...((0, domain_error_js_1.isDomainError)(exception)
          ? { kind: exception.kind, code: exception.code }
          : {}),
      };
    }
    return { value: String(exception) };
  }
});
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter =
  HttpExceptionFilter =
  HttpExceptionFilter_1 =
    __decorate([(0, common_1.Catch)()], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map
