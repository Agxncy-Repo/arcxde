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
import { v4 as uuid } from 'uuid';

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

const REQUEST_ID_HEADER = 'x-request-id';
const CORRELATION_ID_HEADER = 'x-correlation-id';

// Reject IDs that look like injection attempts. UUID/CUID/ULIDs all fit easily.
const VALID_ID = /^[A-Za-z0-9_-]{8,128}$/;

const pickIncomingId = (req: FastifyRequest): string | null => {
  const headerValue = req.headers[REQUEST_ID_HEADER] ?? req.headers[CORRELATION_ID_HEADER];
  if (typeof headerValue !== 'string') {
    return null;
  }
  return VALID_ID.test(headerValue) ? headerValue : null;
};

export const registerRequestIdHook = (app: FastifyInstance): void => {
  app.addHook('onRequest', (req: FastifyRequest, reply: FastifyReply, done) => {
    const id = pickIncomingId(req) ?? uuid();
    // Replace Fastify's internal id so log lines (which include req.id) are correlated.
    (req as unknown as { id: string }).id = id;
    void reply.header(REQUEST_ID_HEADER, id);
    done();
  });
};
