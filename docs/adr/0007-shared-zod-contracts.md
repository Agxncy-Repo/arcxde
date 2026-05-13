# ADR-0007: Zod schemas as the single source of truth for contracts

- **Status:** Accepted
- **Date:** [DATE]
- **Deciders:** Founding engineers
- **Tags:** types, validation, contracts

---

## Context

Validation logic has historically lived in three places: backend validators, frontend form validators, and TypeScript types. They drift. The drift costs us bugs and engineer-hours.

## Decision

We will use **Zod schemas** as the single source of truth for:
- Request and response shapes.
- Form input validation on the frontend.
- TypeScript types (`z.infer<>`).

Schemas live in `packages/contracts/` and are imported by both `apps/api` (via a custom `ZodValidationPipe`) and `apps/web` (via `zodResolver` for forms and as the basis for the generated typed API client).

## Consequences

### Positive
- One change updates BE validation, FE form validation, and TS types simultaneously.
- Errors are typed end-to-end — a renamed field surfaces as a TS error in both apps.
- Less code: no separate DTO classes (NestJS) and Yup schemas (FE).

### Negative
- Couples FE and BE through a shared package — independent deploys of one without the other need careful version handling.
- Zod has a runtime cost; on hot paths, very large schemas measurably affect parse time. Mitigation: avoid `.refine()` for trivial checks; use `.strict()` deliberately.
- NestJS conventions assume class-validator; engineers from a Nest background need to learn the alternative.

### Neutral
- We accept that this couples two apps. The coupling is desirable.

## Alternatives considered

### class-validator + class-transformer (Nest default)
- Pros: idiomatic NestJS.
- Cons: backend-only, can't share with FE, decorators less ergonomic than Zod schemas, runtime metadata reliance.
- Verdict: rejected.

### io-ts / Effect Schema
- Pros: powerful type-level reasoning.
- Cons: steeper learning curve, smaller community.
- Verdict: rejected.

### Hand-written types + manual validation
- Pros: zero dependencies.
- Cons: the exact drift problem we're trying to solve.
- Verdict: rejected.

## References

- [Backend Architecture §6](../architecture/backend.md#6-validation-zod-pipe)
- [Frontend Architecture §7](../architecture/frontend.md#7-forms)
