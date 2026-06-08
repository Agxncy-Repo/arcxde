# ADR-0006: Monorepo with pnpm + Turborepo

- **Status:** Accepted
- **Date:** [DATE]
- **Deciders:** Founding engineers
- **Tags:** repo, tooling, dx

---

## Context

We have multiple deployable units (API, web, future workers, future mobile) that share:

- Validation schemas and TypeScript types.
- UI primitives.
- Lint, format, and TS configurations.
- Utility helpers.

We need fast incremental builds and clean code sharing without npm-publishing internal packages.

## Decision

- **Repo:** single Git repository (monorepo).
- **Package manager:** pnpm with workspaces.
- **Task runner:** Turborepo with remote caching.

Structure:

```
apps/{api, web}
packages/{contracts, ui, config, utils}
```

## Consequences

### Positive

- Atomic refactors across BE / FE / shared code in one PR.
- Shared packages without versioning overhead.
- pnpm's strict node_modules layout catches phantom dependencies.
- Turbo's caching makes CI fast even as the repo grows.

### Negative

- CI configuration is more nuanced (which app changed → which jobs run).
- Onboarding requires learning the monorepo layout.
- A bad shared dependency change can break everything at once. Mitigated by good test coverage and per-package CI.

### Neutral

- We start with `pnpm` not `npm`/`yarn` — small switching cost upfront.

## Alternatives considered

### Polyrepo (one repo per app/package)

- Pros: independent CI, independent versioning.
- Cons: coordination cost for cross-cutting changes, internal npm registry needed, version drift on shared code.
- Verdict: rejected — coordination cost is too high at our team size.

### Nx

- Pros: powerful, full-featured.
- Cons: heavier abstraction, more opinionated, higher learning curve.
- Verdict: rejected for our scale. Turbo is simpler and sufficient.

## References

- [Repository structure (README)](../../README.md#repository-structure)
