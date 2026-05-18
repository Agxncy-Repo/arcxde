/**
 * Request-ID hook for Fastify.
 *
 * Responsibilities:
 *   - If the client sent X-Request-Id (or X-Correlation-Id), trust it (after
 *     length/format validation) so distributed traces stitch together.
 *   - Otherwise, generate a new UUIDv4.
 *   - Always echo the ID back as X-Request-Id so the client / load balancer
 *     can correlate too.
 *
 * Note: We register this as a Fastify hook in main.ts rather than a NestJS
 * middleware so it runs before EVERY request handler, including health checks
 * and routes that bypass the global guard chain.
 *
 * The request ID also feeds:
 *   - the structured logger (via nestjs-cls AsyncLocalStorage)
 *   - the HttpExceptionFilter envelope
 *   - the OpenTelemetry span as a baggage entry
 */
import type { FastifyInstance } from 'fastify';
export declare const registerRequestIdHook: (app: FastifyInstance) => void;
//# sourceMappingURL=request-id.hook.d.ts.map
