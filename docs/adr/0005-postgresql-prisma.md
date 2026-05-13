# ADR-0005: PostgreSQL + Prisma for the data layer

- **Status:** Accepted
- **Date:** [DATE]
- **Deciders:** Backend engineers
- **Tags:** data, database, orm

---

## Context

We need a database and access layer that supports:
- Transactional integrity across business operations.
- Mixed structured and semi-structured data.
- Reasonable analytics on production data without standing up a separate warehouse on day one.
- Type-safe access from TypeScript.
- A migration story that engineers will actually use.
- Portable across cloud providers and managed services.

## Decision

- **Database:** PostgreSQL 16+.
- **ORM:** Prisma.

## Consequences

### Positive
- ACID transactions across all business data.
- JSONB columns provide flexibility where useful without abandoning relational integrity.
- Prisma's generated types eliminate a class of runtime errors.
- Migration files are reviewable SQL — no hidden DDL.
- Read replicas, PITR, logical replication: all mature.

### Negative
- Prisma's query model adds an abstraction layer; some advanced SQL requires `$queryRaw`.
- Prisma's runtime engine has a small but real overhead vs. raw `pg` / Kysely.
- Connection pooling needs explicit attention (PgBouncer or platform pooler) at scale.
- The `prisma migrate` flow forces a workflow that's slightly different from team members used to raw SQL.

### Neutral
- We accept Prisma as the *one* way data is accessed in the app. No mixing with raw `pg` clients except via Prisma's `$queryRaw`.

## Alternatives considered

### Drizzle ORM
- Pros: closer to SQL, lighter runtime, recent momentum.
- Cons: less mature migration tooling, smaller ecosystem of generators, fewer engineers familiar with it.
- Verdict: a serious contender; rejected primarily on migration tooling and ecosystem maturity at decision time. Revisit annually.

### Kysely (query builder, no ORM)
- Pros: best-in-class types for raw-SQL-feel, no engine overhead.
- Cons: no migration system, schema lives separately from code.
- Verdict: rejected as the primary tool — too much DIY for our stage.

### MySQL / MariaDB
- Pros: familiar, widely hosted.
- Cons: weaker JSON story, less advanced indexing options, lower ceiling for analytics.
- Verdict: rejected.

### MongoDB
- Pros: schemaless flexibility.
- Cons: weaker transactional story, schema discipline shifts to application code.
- Verdict: rejected for the system of record. May appear later as a cache or specialized store if needed.

## References

- [Database & Prisma](../architecture/database.md)
