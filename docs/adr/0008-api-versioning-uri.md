# ADR-0008: URI-based API versioning

- **Status:** Accepted
- **Date:** [DATE]
- **Deciders:** Backend engineers
- **Tags:** api, versioning

---

## Context

We will accumulate breaking changes over time. We need a versioning strategy that is unambiguous for clients (web, mobile, partners) and predictable for the team.

## Decision

API versioning is **URI-based**: `/api/v1/...`, `/api/v2/...`. NestJS's URI versioning is enabled at the global prefix.

Rules:
- A new major version is created only when **breaking** changes are needed (removed field, changed type, changed semantics).
- The previous version is supported for a minimum of **6 months** after the new version reaches GA.
- Deprecation is signaled via the `Deprecation: true` and `Sunset: <RFC date>` response headers.
- Non-breaking additions (new fields, new endpoints) ship within the existing version.

## Consequences

### Positive
- Trivially discoverable for clients reading logs or tracing requests.
- Easy to route at the load balancer / WAF level if needed.
- No header parsing required to identify the version in logs.

### Negative
- Code paths can duplicate during the deprecation window — discipline required to keep the duplication shallow (controllers, not services).
- URI changes look like resource changes to some tools — minor cosmetic concern.

### Neutral
- We do not version internal endpoints (admin, ops) — those evolve with the codebase.

## Alternatives considered

### Header-based versioning (`Accept: application/vnd.[project].v2+json`)
- Pros: cleaner URIs, REST-purist preference.
- Cons: harder to debug from logs, harder to test from a browser, easy to forget the header.
- Verdict: rejected.

### Query parameter versioning (`?v=2`)
- Pros: simple.
- Cons: easy to omit, mixes versioning with filtering semantics.
- Verdict: rejected.

### Always backward-compatible — never break
- Pros: clients never need to migrate.
- Cons: forces baroque designs (`fooV2`, `bar_new`) that bloat over time.
- Verdict: rejected as the default. We aim to break rarely, but we will not contort the API to never break.

## References

- [API Design Conventions](../conventions/api-design.md)
