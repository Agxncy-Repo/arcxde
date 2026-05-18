'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.registerRequestIdHook = void 0;
const uuid_1 = require('uuid');
const REQUEST_ID_HEADER = 'x-request-id';
const CORRELATION_ID_HEADER = 'x-correlation-id';
// Reject IDs that look like injection attempts. UUID/CUID/ULIDs all fit easily.
const VALID_ID = /^[A-Za-z0-9_-]{8,128}$/;
const pickIncomingId = (req) => {
  const headerValue = req.headers[REQUEST_ID_HEADER] ?? req.headers[CORRELATION_ID_HEADER];
  if (typeof headerValue !== 'string') return null;
  return VALID_ID.test(headerValue) ? headerValue : null;
};
const registerRequestIdHook = (app) => {
  app.addHook('onRequest', (req, reply, done) => {
    const id = pickIncomingId(req) ?? (0, uuid_1.v4)();
    // Replace Fastify's internal id so log lines (which include req.id) are correlated.
    req.id = id;
    void reply.header(REQUEST_ID_HEADER, id);
    done();
  });
};
exports.registerRequestIdHook = registerRequestIdHook;
//# sourceMappingURL=request-id.hook.js.map
