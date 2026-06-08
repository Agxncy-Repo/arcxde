# ADR-0003: NestJS for the backend

- **Status:** Accepted
- **Date:** [DATE]
- **Deciders:** Backend engineers
- **Tags:** backend, framework

---

## Context

We need a backend framework that:

- Is TypeScript-native.
- Has opinionated structure so a 10-person team doesn't reinvent project layout each feature.
- Supports dependency injection (testability).
- Has a mature ecosystem for HTTP, queues, scheduled jobs, validation, OpenAPI, microservice transport.
- Lets us migrate to microservices later without rewrite.

## Decision

We will use **NestJS** as the backend framework, with:

- Fastify adapter (over Express) for performance.
- Custom Zod-based validation pipe (not class-validator) to share schemas with the frontend.
- BullMQ for queues.
- Prisma for data access.

## Consequences

### Positive

- Strong conventions reduce bikeshedding on file layout.
- DI makes services trivially unit-testable.
- Rich decorator ecosystem (`@UseGuards`, `@UseInterceptors`) makes cross-cutting concerns declarative.
- Module boundaries are first-class — aligns with [ADR-0002](./0002-modular-monolith.md).
- Built-in support for microservice transport when we eventually extract.

### Negative

- Decorator-heavy syntax has a learning curve for engineers from Express/Fastify backgrounds.
- More magic than a hand-rolled framework. Mitigation: enforce constructor injection only, no `forwardRef` without a comment.
- Class-based — slightly more ceremony than functional alternatives.

### Neutral

- Choosing Fastify adapter means we can't use Express middleware that depends on the raw `req`/`res` shape without wrapping.

## Alternatives considered

### Express (or Fastify) hand-rolled

- Pros: full control, minimal magic, fast.
- Cons: every team reinvents structure, DI is bolt-on, testability suffers.
- Verdict: rejected — discipline doesn't scale across team turnover.

### Hono / tRPC

- Pros: lightweight, end-to-end types with tRPC.
- Cons: tRPC couples FE to BE in ways that make non-web clients harder later; smaller ecosystems for queue/cron/RBAC.
- Verdict: rejected — we want REST + OpenAPI as a long-lived contract.

### Adonis

- Pros: opinionated, full-stack, MVC.
- Cons: smaller community, fewer engineers familiar with it.
- Verdict: rejected on talent pool grounds.

## References

- [Backend Architecture](../architecture/backend.md)
- [ADR-0007: Zod schemas as contracts](./0007-shared-zod-contracts.md)
