# Performance Playbook

> **Maintainer:** Platform Team
> **Last reviewed:** [DATE]

Performance is a feature. We treat it like security — budgets, gates, and a culture of measuring before optimizing.

---

## 1. Budgets

| Surface          | Metric           | Budget              |
| ---------------- | ---------------- | ------------------- |
| API              | P50 latency      | < 80ms              |
| API              | P95 latency      | < 200ms             |
| API              | P99 latency      | < 500ms             |
| API              | Error rate       | < 0.1%              |
| Web (mobile, 4G) | LCP              | < 2.5s              |
| Web              | INP              | < 200ms             |
| Web              | CLS              | < 0.1               |
| Web              | First-load JS    | < 200 KB gzipped    |
| DB               | P95 query time   | < 50ms              |
| Queue            | Job P95 duration | per-job, documented |

PRs that exceed budgets are blocked unless an owner approves an explicit exception with a remediation plan.

---

## 2. Measure first

Every performance investigation starts with **production data**, not local benchmarks.

Order of operations:

1. **Define the problem** — which endpoint, which percentile, what user impact.
2. **Find the slow component** — distributed trace, not gut feeling.
3. **Profile that component** — flamegraph, query plan, network waterfall.
4. **Fix the dominant cost** — Amdahl's law, no shaving cycles off something that's 2% of the time.
5. **Verify in production** — same metric, post-deploy.

> "Premature optimization is the root of all evil." — Knuth.
> The corollary: **late** optimization is the second-most-common one.

---

## 3. Backend tactics

### 3.1 Eliminate N+1

The single most common backend perf bug. Detected by query count per request:

- ESLint rule + middleware that fails tests when a single request issues > 30 queries.
- Prisma logging in dev with `log: ['query']` to spot fan-out.
- Fix with `include` / `select` (eager loading), or with a `DataLoader`-style batcher when the call sites are distributed.

### 3.2 Project narrowly

```typescript
// ❌ Loads 30+ fields, including JSONB blobs
await prisma.order.findMany({ where: { userId } });

// ✅ 5 fields
await prisma.order.findMany({
  where: { userId },
  select: { id: true, total: true, status: true, currency: true, createdAt: true },
});
```

### 3.3 Index every hot WHERE/ORDER BY

- Foreign keys: indexed.
- Composite indexes for `(user_id, created_at DESC)`-style lists.
- `EXPLAIN ANALYZE` on every new query that runs > 100x/min.

### 3.4 Cache deliberately

Cache hierarchy:

1. **In-memory LRU** for tiny read-mostly data (feature flags) — single-digit µs.
2. **Redis** for shared computed values, query results, rate counters.
3. **HTTP cache** at CDN / proxy layer for public/anonymous responses.

Cache rules:

- Always with a TTL. Forever-caches become forever-bugs.
- Versioned keys (`:v3`) — bump on shape changes, never deploy a shape change to the same key.
- Cache **on read**, invalidate **on write** within the same module. Don't fan invalidation out.

### 3.5 Offload to queues

Anything > ~100ms that isn't strictly required for the response — queue it.

- Emails, exports, third-party syncs, billing reconciliation.
- Queue jobs are idempotent (see [Backend §9](../architecture/backend.md#9-async-work-bullmq)).

### 3.6 Avoid double serialization

- Don't `JSON.parse(JSON.stringify(obj))` to "clone." Use `structuredClone`.
- Don't shape data twice (DB → DTO → response DTO) when one mapping would do.

### 3.7 Streaming where it matters

- Large exports: stream from DB cursor → S3 (don't buffer in memory).
- Reports > a few MB: pre-render to S3, return signed URL.

### 3.8 Use the read replica

Long-running analytics queries, list endpoints with relaxed freshness — point to the replica. Writes and read-your-writes go to primary.

---

## 4. Frontend tactics

### 4.1 Ship less JS

- RSC by default; `'use client'` only when needed.
- Dynamic `import()` for heavy widgets (charts, editors, code blocks).
- `next/dynamic` with `ssr: false` for client-only libraries.
- Audit the bundle: `pnpm --filter web analyze`. Sort by size, kill the biggest unused dependency.

### 4.2 Optimize images

- `next/image` exclusively. Responsive `sizes`.
- AVIF + WebP via the image optimizer.
- Above-the-fold images: `priority` flag.

### 4.3 Fonts

- `next/font` (self-hosted).
- `display: swap`.
- Subset to used glyphs when possible.

### 4.4 Streaming + Suspense

Render the shell immediately, stream slow data in. Never block the document on a slow API.

```tsx
<Shell>
  <Suspense fallback={<DashboardSkeleton />}>
    {/* awaited inside */}
    <DashboardData />
  </Suspense>
</Shell>
```

### 4.5 Prefetch wisely

- `<Link prefetch>` on visible nav.
- TanStack Query's `prefetchQuery` on hover for cards that lead to detail pages.

### 4.6 Avoid layout shift

- Reserve space for async content (skeletons sized to expected content).
- `<Image>` always has width + height (or `fill` + sized container).
- Don't inject content above existing content.

### 4.7 Memoize judiciously

- `useMemo` / `useCallback` for **measured** hot paths, not by reflex. They have their own cost.
- `memo()` for components inside hot lists, not for everything.

---

## 5. Database tactics

### 5.1 EXPLAIN ANALYZE habits

Before merging a query that runs > 100x/minute:

1. Run on a production-shaped dataset.
2. Confirm it uses an index.
3. Confirm no `Sort` step over > 10k rows.
4. Confirm no `Hash Join` with > 100k rows on either side.

### 5.2 Watch the long tail

P95 is the metric. Average latency hides the worst experiences. A query that's fast for 99 users and 5 seconds for 1 is unacceptable.

### 5.3 Bulk operations

- `createMany`, `updateMany` over loops.
- `Prisma.$queryRaw` with `unnest` for genuinely large batches.

### 5.4 Pagination

- Cursor pagination on hot lists. Offset on cold/admin lists only.
- Always `take`. Never an unbounded `findMany`.

### 5.5 Lock discipline

- `for update` only inside short transactions.
- Hold locks for milliseconds, not seconds.
- Never do network I/O while holding a row lock.

---

## 6. Connection management

- Postgres `max_connections` is finite. PgBouncer (transaction pooling) in front in any deployment with > 2 app replicas.
- App-side: Prisma `connection_limit` is per-instance. Tune so total connections stay under PgBouncer pool size.
- Long idle in-app connections are a leak — investigate.

---

## 7. Load testing

For surfaces with traffic risk (launches, marketing pushes, billing day):

- k6 script in `/performance/`.
- Run against staging at expected peak + 2x.
- Assert: P95 within budget, error rate < 0.1%, no DB or queue saturation.

---

## 8. Observability hooks

Performance work requires the signals to exist before you start:

- Per-endpoint histograms in metrics.
- Distributed trace on slow requests sampled at 100%.
- Slow query log enabled in Postgres (statements > 200ms).
- RUM on the web app for LCP/INP/CLS — synthetic Lighthouse is supplementary.

See [Observability](../architecture/observability.md).

---

## 9. Anti-patterns

- ❌ "Premature optimization" used as a slogan to skip _all_ optimization. Budgets are not premature.
- ❌ Caching to fix bad queries — fix the query first.
- ❌ Removing features to "make it faster" without measuring.
- ❌ Optimizing local-dev numbers. Production hardware behaves differently.
- ❌ Adding a Redis cache around a 5ms query.

---

## 10. References

- [System Overview](../architecture/overview.md)
- [Backend Architecture](../architecture/backend.md)
- [Database & Prisma](../architecture/database.md)
- [Observability](../architecture/observability.md)
