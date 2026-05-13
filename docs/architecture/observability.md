# Observability

> **Maintainer:** Platform Team
> **Last reviewed:** [DATE]
> **Status:** Living document

---

## 1. Why

You cannot operate a system you cannot see. Every feature must be observable on day one of production traffic — not retroactively after an incident.

We instrument for **three signals** + one cross-cutter:
1. **Logs** — discrete events with context.
2. **Metrics** — aggregated time-series of behavior.
3. **Traces** — end-to-end request paths.
4. **Errors** — exceptions captured with full context (Sentry).

All four share a **`traceId`** so an alert links to logs, metrics dashboards, and traces in one click.

---

## 2. Stack

| Signal | Tool | Storage |
|---|---|---|
| Logs | Pino → Vector / Fluent Bit | Loki / Datadog / CloudWatch |
| Metrics | OpenTelemetry SDK + Prometheus exporter | Prometheus / Datadog |
| Traces | OpenTelemetry SDK | Tempo / Jaeger / Datadog APM |
| Errors | Sentry SDK | Sentry SaaS |
| Uptime | Synthetic checks (Checkly / better-uptime) | Provider |
| Dashboards | Grafana / Datadog | — |

OpenTelemetry is the abstraction. Storage backend is replaceable.

---

## 3. Correlation IDs

Every inbound request gets:
- `x-request-id` (or generated if missing) — short, customer-friendly, returned in response headers.
- `traceId` — OpenTelemetry W3C trace context.

Both are placed on the **AsyncLocalStorage context** and injected into:
- Every log line.
- Every outbound HTTP header.
- Every queued job's payload (so the worker logs continue the trace).
- Every DB query (Prisma comment, optional).

---

## 4. Logging

```typescript
this.logger.info(
  { event: 'order.created', orderId, userId, totalCents },
  'Order created',
);
```

### Levels
| Level | When |
|---|---|
| `fatal` | Process must exit |
| `error` | Unhandled exception, integration broken — alerts |
| `warn` | Recoverable degradation, rate-limit triggers, retries |
| `info` | Business events (signup, purchase) and lifecycle (boot, shutdown) |
| `debug` | Off in prod; on in dev for noisy detail |
| `trace` | Disabled by default; flip per-request via header |

### Rules
- **Structured first.** Fields, not prose.
- **One log per significant event.** Don't log the same thing in three layers.
- **No secrets.** Redaction is enforced; don't rely on it.
- **No log-and-throw.** Log at the boundary, not inside.

---

## 5. Metrics

### RED + USE
- **RED** for services: **R**ate, **E**rrors, **D**uration.
- **USE** for resources: **U**tilization, **S**aturation, **E**rrors.

### Default metric set (auto-instrumented)
- `http_server_duration_ms{route,method,status}` — histogram.
- `http_server_requests_total{route,method,status}` — counter.
- `db_query_duration_ms{operation,model}` — histogram.
- `queue_job_duration_ms{queue,name,status}` — histogram.
- `cache_operations_total{op,result}` — counter (hit/miss/error).

### Business metrics (hand-instrumented)
Every feature with revenue or growth impact ships at least one custom metric:
- `signups_total{source}`
- `checkouts_completed_total{plan}`
- `feature_xyz_invocations_total{outcome}`

### Cardinality discipline
- No user IDs in label keys.
- No URLs with raw IDs in labels — use route templates (`/users/:id`).
- Keep label cardinality < 100 per metric.

---

## 6. Tracing

OpenTelemetry SDK initialized in `infrastructure/observability/`. Auto-instruments:
- HTTP server + client (`@opentelemetry/instrumentation-http`).
- Prisma (`@prisma/instrumentation`).
- Redis / BullMQ.
- AWS SDK.

Add custom spans for non-trivial business operations:
```typescript
await tracer.startActiveSpan('billing.charge', async (span) => {
  span.setAttribute('billing.amount_cents', amountCents);
  try { /* ... */ } catch (e) { span.recordException(e); span.setStatus({ code: 2 }); throw e; }
  finally { span.end(); }
});
```

**Sampling:** head-based at 10% in prod by default; **always sample errors**; **always sample slow requests** (> 1s).

---

## 7. Errors (Sentry)

- Initialized before app bootstrap.
- `beforeSend` strips PII.
- Releases tagged with git SHA.
- Source maps uploaded in CI.
- Issues assigned by code owner (CODEOWNERS).

What gets sent:
- All unhandled exceptions.
- 5xx responses with full request context.
- Critical worker failures.

What does **not** get sent:
- 4xx client errors (validation, auth).
- Cancelled requests.

---

## 8. Health Endpoints

| Endpoint | Returns |
|---|---|
| `/health` | `200` if process alive |
| `/ready` | `200` only if DB + Redis reachable |
| `/metrics` | Prometheus exposition format |

`/ready` is used by the orchestrator for traffic gating; `/health` for liveness.

---

## 9. SLOs

| Service | SLI | Target | Window |
|---|---|---|---|
| API | P95 latency < 200ms | 99% of minutes | 30 days |
| API | Error rate < 0.1% | 99.9% | 30 days |
| Web | LCP < 2.5s (RUM) | 90% of sessions | 30 days |
| Worker | Job success rate > 99.5% | 99.5% | 30 days |

**Error budget policy:**
- Budget burned > 50% mid-window → freeze risky changes, focus reliability.
- Budget burned > 100% → no feature deploys until back in budget.

---

## 10. Dashboards

Every service has:
1. **Overview** — RED + saturation, one screen.
2. **Per-endpoint drill-down** — top N endpoints by traffic and latency.
3. **Business KPIs** — signups, conversions, revenue.

Dashboards live as code (JSON / Terraform / Grafonnet) under `/ops/dashboards/`.

---

## 11. Alerting

### Rules
- Alerts are **actionable**. If there's no runbook step, it's not an alert — it's a metric.
- Every alert links to: dashboard, runbook, and the relevant module owner.
- Symptom-based, not cause-based (alert on "checkouts failing," not "queue depth > 1000" unless that's the symptom).

### Severity
| Level | Response | Channel |
|---|---|---|
| P1 | Page on-call, < 15 min | PagerDuty + Slack |
| P2 | Notify channel, < 4h business | Slack |
| P3 | Ticket, < 1 sprint | Linear / Jira |

---

## 12. Audit Logging vs. Operational Logging

Two distinct concerns:
- **Operational logs** → ephemeral, indexed for debugging.
- **Audit logs** → durable, append-only DB table (see [Database §9](./database.md#9-audit-trails)). Independent of log storage.

Don't mix them.

---

## 13. Cost Awareness

Observability has a real bill. Quarterly review:
- Top log producers — silence noisy `info` lines.
- Metric cardinality — kill unused labels.
- Trace sampling — tune if storage > budget.

---

## 14. References

- [Backend Architecture](./backend.md)
- [Performance Playbook](../operations/performance.md)
- [Incident Response](../confluence/incident-response.md)
