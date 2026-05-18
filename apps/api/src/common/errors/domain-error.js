'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.isDomainError = exports.DomainError = void 0;
const KIND_TO_STATUS = {
  VALIDATION_FAILED: 422,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  PRECONDITION_FAILED: 412,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
  UNAVAILABLE: 503,
  BAD_REQUEST: 400,
};
class DomainError extends Error {
  constructor(kind, code, message, options = {}) {
    super(message, options.cause ? { cause: options.cause } : undefined);
    this.name = 'DomainError';
    this.kind = kind;
    this.code = code;
    this.httpStatus = KIND_TO_STATUS[kind];
    if (options.details !== undefined) {
      this.details = options.details;
    }
    // V8 stack capture
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DomainError);
    }
  }
  // ---- Factory helpers — preferred over `new DomainError(...)` at call sites ----
  static validation(code, message, options) {
    return new DomainError('VALIDATION_FAILED', code, message, options);
  }
  static unauthenticated(message = 'Authentication required', options) {
    return new DomainError('UNAUTHENTICATED', 'UNAUTHENTICATED', message, options);
  }
  static forbidden(message = 'Forbidden', options) {
    return new DomainError('FORBIDDEN', 'FORBIDDEN', message, options);
  }
  static notFound(resource, options) {
    return new DomainError(
      'NOT_FOUND',
      `${resource.toUpperCase()}_NOT_FOUND`,
      `${resource} not found`,
      options,
    );
  }
  static conflict(code, message, options) {
    return new DomainError('CONFLICT', code, message, options);
  }
  static precondition(code, message, options) {
    return new DomainError('PRECONDITION_FAILED', code, message, options);
  }
  static rateLimited(message = 'Rate limit exceeded', options) {
    return new DomainError('RATE_LIMITED', 'RATE_LIMITED', message, options);
  }
  static internal(message = 'Internal error', options) {
    return new DomainError('INTERNAL_ERROR', 'INTERNAL_ERROR', message, options);
  }
  static unavailable(message = 'Service unavailable', options) {
    return new DomainError('UNAVAILABLE', 'SERVICE_UNAVAILABLE', message, options);
  }
  static badRequest(code, message, options) {
    return new DomainError('BAD_REQUEST', code, message, options);
  }
}
exports.DomainError = DomainError;
const isDomainError = (e) => e instanceof DomainError;
exports.isDomainError = isDomainError;
//# sourceMappingURL=domain-error.js.map
