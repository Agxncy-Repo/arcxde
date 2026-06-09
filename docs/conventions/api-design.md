# API Design Conventions

> **Maintainer:** Backend Team
> **Last reviewed:** [DATE]

We follow **REST**, pragmatic over purist. Consistency is the goal — a developer who's used one endpoint should be able to predict the next one.

---

## 1. Base URL & versioning

- All API routes are prefixed: `/api/v1/...`.
- Versioning is URI-based — see [ADR-0008](../adr/0008-api-versioning-uri.md).
- Webhook receivers are not versioned: `/webhooks/{provider}`.

---

## 2. Resource naming

- **Nouns, plural, kebab-case.**
- `/users`, `/orders`, `/audit-logs`. Not `/user`, `/getUser`, `/auditLog`.
- Sub-resources: `/organizations/{orgId}/members`.
- Avoid deep nesting beyond two levels. Use query params or top-level resources instead.

| Want    | Path                  | Method |
| ------- | --------------------- | ------ |
| List    | `/orders`             | GET    |
| Get one | `/orders/{id}`        | GET    |
| Create  | `/orders`             | POST   |
| Replace | `/orders/{id}`        | PUT    |
| Patch   | `/orders/{id}`        | PATCH  |
| Delete  | `/orders/{id}`        | DELETE |
| Action  | `/orders/{id}:cancel` | POST   |

Actions that don't fit CRUD use the `:verb` suffix (Google AIP-136). Not `/orders/{id}/cancel`, which reads as a sub-resource.

---

## 3. IDs

- Always prefixed: `usr_*`, `org_*`, `ord_*`. Self-documenting in logs.
- Validated in path params against the expected prefix.

---

## 4. Request format

- `Content-Type: application/json` for all non-trivial bodies.
- Multipart/form-data only for file uploads.
- Request body is a JSON object — never a bare array or primitive at the top level.
- Field names: `camelCase`.

---

## 5. Response format

### Single resource

```json
{
  "data": {
    "id": "ord_abc",
    "total": "199.99",
    "currency": "USD",
    "status": "PAID",
    "createdAt": "2026-05-12T10:00:00Z"
  }
}
```

### Collection (cursor pagination)

```json
{
  "data": [
    /* items */
  ],
  "pagination": {
    "nextCursor": "ord_xyz",
    "hasMore": true,
    "limit": 20
  }
}
```

### Empty data

- Single resource not found → `404` with error envelope, **not** `{ data: null }`.
- Empty collection → `200` with `data: []`.

### Field rules

- Money: stringified decimal + `currency` field. Never floats.
- Timestamps: ISO-8601 UTC, suffix `Z`. Always `*At` suffix (`createdAt`, `expiresAt`).
- Enums: UPPER_SNAKE strings — `PENDING`, `IN_PROGRESS`.
- Booleans: `is*` / `has*` prefix.
- Don't include fields you can't populate. No `"foo": null` placeholders.

---

## 6. Error format

```json
{
  "error": {
    "code": "ORDER_NOT_FOUND",
    "message": "No order with the given id exists.",
    "requestId": "req_abc123",
    "details": {
      "orderId": "ord_xyz"
    }
  }
}
```

| HTTP | When                                                     |
| ---- | -------------------------------------------------------- |
| 400  | Malformed input that wasn't caught by validation         |
| 401  | No / invalid credentials                                 |
| 403  | Authenticated but not authorized                         |
| 404  | Resource not found, or hidden from this user             |
| 409  | Conflict (e.g., unique constraint)                       |
| 410  | Resource permanently gone                                |
| 412  | Precondition failed (idempotency conflict)               |
| 422  | Validation failed — body shape was right, values weren't |
| 429  | Rate limited; include `Retry-After`                      |
| 500  | Server bug                                               |
| 503  | Dependency down                                          |

### Validation errors (422)

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Request body is invalid.",
    "requestId": "req_abc123",
    "details": {
      "fields": [
        { "path": "email", "message": "Must be a valid email" },
        { "path": "age", "message": "Must be at least 18" }
      ]
    }
  }
}
```

### Error codes

- UPPER_SNAKE.
- Stable across versions. Adding a new code is non-breaking; renaming is breaking.
- Documented in OpenAPI + a central error code reference.

---

## 7. Pagination

- **Cursor-based by default** on lists. Stable under inserts; cheaper at scale.
- Query params: `?cursor=<id>&limit=20`. Max `limit` = 100.
- Response includes `pagination.nextCursor` (null when done) and `hasMore`.
- Offset pagination only allowed when the consumer genuinely needs page numbers (admin UIs) and the dataset is small.

---

## 8. Filtering, sorting, search

- Filtering: explicit query params. `?status=PAID&customerId=usr_x`.
- Free-form search: `?q=...`. Implementation behind a single param so search infra can change.
- Sorting: `?sort=-createdAt,total`. Comma-separated, `-` for descending. Server defines whitelist.

---

## 9. Idempotency

All `POST`/`PATCH`/`DELETE` accept an `Idempotency-Key` header.

- Key + auth identity is the dedup tuple.
- First request: process, store the response for 24h, return it.
- Subsequent request with same key: return the stored response **without** re-running side effects.
- Conflicting request (same key, different body): `412 Precondition Failed`.

---

## 10. Rate limiting

Returns `429 Too Many Requests` with:

- `Retry-After: <seconds>`
- `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers.

---

## 11. Auth

- `Authorization: Bearer <jwt>` for non-browser clients.
- Cookie auth for browser. The cookie itself is the credential — no `Authorization` header.
- Tokens never appear in query strings.

---

## 12. Caching

- Cache-friendly GETs include `Cache-Control` and `ETag`.
- Conditional requests supported via `If-None-Match`.
- Authenticated responses are `Cache-Control: private` by default.

---

## 13. CORS

- Allowlist of origins. No wildcards in production.
- Preflight cached for 1 hour (`Access-Control-Max-Age: 3600`).
- `credentials: 'include'` only against listed origins.

---

## 14. Webhooks (outbound)

- POST JSON to customer-configured URL.
- Headers:
  - `X-Webhook-Id` (unique per event)
  - `X-Webhook-Signature: sha256=<hex>` (HMAC over raw body)
  - `X-Webhook-Timestamp: <unix>` (within 5 minutes)
- Retries with exponential backoff up to 24 hours; then alert + DLQ.
- Customers can rotate their signing secret with zero downtime (dual-key window).

---

## 15. Documenting endpoints

Every endpoint has, in OpenAPI:

- A unique `operationId` (camelCase verb-noun: `createOrder`).
- Tag(s) by module.
- Description in plain English.
- Request + response schemas (auto-generated from Zod).
- All possible error codes listed.

---

## 16. Anti-patterns

- ❌ Mixing query and body parameters for the same logical input.
- ❌ Returning different shapes from the same endpoint based on parameters.
- ❌ HTTP 200 with `{ success: false }` in the body. Use HTTP status codes.
- ❌ Verbs in URIs (`/getUser`, `/createOrder`). Use HTTP methods.
- ❌ Returning DB IDs without the prefix.
- ❌ Hidden side effects on GET (you'd be amazed).

---

## 17. References

- [Google AIP](https://google.aip.dev/) — reference style guide we partially follow.
- [Backend Architecture](../architecture/backend.md)
- [ADR-0008: API versioning](../adr/0008-api-versioning-uri.md)
