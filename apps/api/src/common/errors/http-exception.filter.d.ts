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
import { ArgumentsHost, type ExceptionFilter } from '@nestjs/common';
import { DomainError } from './domain-error.js';
export declare class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger;
  catch(exception: unknown, host: ArgumentsHost): void;
  private toPayload;
  private statusToCode;
  private serializeError;
}
export { DomainError };
//# sourceMappingURL=http-exception.filter.d.ts.map
