/**
 * DomainError — the single error type the application layer throws.
 *
 * Why:
 *   - Stable, machine-readable `code` strings drive client UX, alerting, and audits.
 *   - `httpStatus` lets the exception filter map errors to responses without
 *     a giant switch statement.
 *   - `details` carries structured context (field paths, conflicting values),
 *     never raw stack traces — those go to logs only.
 *
 * Do NOT subclass for every variant. Use the factory helpers below to keep
 * call sites concise and the catalogue of codes auditable in one place.
 *
 * See docs/architecture/backend.md → error handling.
 * See docs/conventions/api-design.md → error envelope.
 */
export type DomainErrorKind =
  | 'VALIDATION_FAILED'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'PRECONDITION_FAILED'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'UNAVAILABLE'
  | 'BAD_REQUEST';
export interface DomainErrorOptions {
  /** Optional structured context. Must be JSON-serializable, never contain secrets. */
  details?: Record<string, unknown>;
  /** Original error for log enrichment. Never serialized to the client. */
  cause?: unknown;
}
export declare class DomainError extends Error {
  readonly kind: DomainErrorKind;
  readonly code: string;
  readonly httpStatus: number;
  readonly details?: Record<string, unknown>;
  constructor(kind: DomainErrorKind, code: string, message: string, options?: DomainErrorOptions);
  static validation(code: string, message: string, options?: DomainErrorOptions): DomainError;
  static unauthenticated(message?: string, options?: DomainErrorOptions): DomainError;
  static forbidden(message?: string, options?: DomainErrorOptions): DomainError;
  static notFound(resource: string, options?: DomainErrorOptions): DomainError;
  static conflict(code: string, message: string, options?: DomainErrorOptions): DomainError;
  static precondition(code: string, message: string, options?: DomainErrorOptions): DomainError;
  static rateLimited(message?: string, options?: DomainErrorOptions): DomainError;
  static internal(message?: string, options?: DomainErrorOptions): DomainError;
  static unavailable(message?: string, options?: DomainErrorOptions): DomainError;
  static badRequest(code: string, message: string, options?: DomainErrorOptions): DomainError;
}
export declare const isDomainError: (e: unknown) => e is DomainError;
//# sourceMappingURL=domain-error.d.ts.map
