# ADR-0002: Modular monolith over microservices (for now)

- **Status:** Accepted
- **Date:** [DATE]
- **Deciders:** Founding engineers
- **Tags:** architecture, backend

---

## Context

We need to ship a non-trivial product with a small team. The default industry conversation pushes for microservices, but the team is < 10 engineers, the domain is not yet stable, and we have no independent scaling pressure on any subsystem.

## Decision

We will start as a **modular monolith**: a single deployable application composed of strongly-bounded modules with explicit public interfaces and no shared internals.

We will extract a module into a separate service only when **all** of the following are true:
1. The module has an independent scaling profile (CPU / memory / IO).
2. The module is owned by an independent team with separate release cadence.
3. The operational and coupling cost of in-process integration exceeds the cost of network calls + service ownership.

## Consequences

### Positive
- One deployment, one database, atomic refactors across modules.
- Lower operational complexity: one binary to monitor, debug, profile.
- Faster iteration: cross-module changes don't need cross-repo coordination.
- Strong module boundaries mean *future* extraction is straightforward when justified.

### Negative
- All teams share a deployment cadence and risk profile.
- Vertical scaling has limits; eventually we will need to break things out.
- Discipline required: developers must respect module boundaries even though the compiler doesn't force them at deploy time.

### Neutral
- Workers run the same codebase as the API, just a different entrypoint.

## Alternatives considered

### Microservices from day one
- Pros: forced modularity, independent deploys.
- Cons: ops complexity, distributed transaction headaches, premature for our scale, slows the small team.
- Verdict: rejected. The benefits accrue at scale we don't have yet.

### Serverless-first
- Pros: zero ops, pay-per-use.
- Cons: cold starts, vendor lock-in, debugging is painful, Prisma + Postgres connection pooling is awkward.
- Verdict: rejected for the core API. We may use serverless for specific edge use cases.

## References

- [ADR-0003: NestJS for the backend](./0003-nestjs-backend.md)
- [Modular Monoliths — Simon Brown](https://www.youtube.com/watch?v=5OjqD-ow8GE)
