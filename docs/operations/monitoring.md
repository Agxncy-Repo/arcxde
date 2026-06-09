# Monitoring & Alerting

**Owner:** Platform / SRE
**Last reviewed:** _set on commit_
**Status:** Living

> Companion to [observability.md](../architecture/observability.md). Observability tells you what's possible to know about the system. This document tells you what we actually watch, who gets paged, and where to look first.

---

## 1. Principles

1. **Alert on symptoms, not causes.** "Checkout error rate > 1%" is a symptom users feel. "Redis CPU > 80%" is a cause that may not matter. Cause-based alerts go to dashboards; symptom-based alerts page humans.
2. **Every alert is actionable.** If the on-call has nothing to do but acknowledge, the alert should not exist. Delete or downgrade it.
3. **Every alert links to a runbook.** No runbook → no alert in production.
4. **SLO-driven.** Paging severity follows error-budget burn rate, not arbitrary thresholds.
5. **Dashboards as code.** Grafana / Datadog dashboards live in `infra/observability/` and ship via PR like everything else.

---

## 2. The four signals we always watch

For every user-facing service, we track **RED**:

| Signal       | Definition                                               | Why                                                                |
| ------------ | -------------------------------------------------------- | ------------------------------------------------------------------ |
| **R**ate     | Requests per second                                      | Detect traffic anomalies (DDoS, marketing spike, integration loop) |
| **E**rrors   | Error rate (5xx + handled domain errors that map to 5xx) | Detect regressions before users complain                           |
| **D**uration | Latency distribution (P50, P95, P99)                     | Detect slow degradation                                            |

For every resource (DB, cache, queue, host), we track **USE**:

| Signal          | Definition                                               |
| --------------- | -------------------------------------------------------- |
| **U**tilization | % of resource in use (CPU, memory, connections)          |
| **S**aturation  | Queueing / backpressure (run queue, BullMQ waiting jobs) |
| **E**rrors      | Resource-level errors (connection refused, OOM kills)    |

---

## 3. Dashboards (single source of truth)

All dashboards are versioned in `infra/observability/dashboards/`. Anyone can edit via PR. Anyone can view; no one edits in the UI.

| Dashboard            | Audience              | Purpose                                                                          |
| -------------------- | --------------------- | -------------------------------------------------------------------------------- |
| **Service Overview** | All engineers         | RED for API, Web, Workers, side-by-side                                          |
| **Business KPIs**    | Product + Engineering | Signups, activations, revenue events, conversion funnels                         |
| **Database**         | Backend engineers     | Connections, slow queries top 10, replication lag, cache hit ratio               |
| **Queues**           | Backend engineers     | BullMQ waiting/active/failed/delayed per queue, P95 job duration                 |
| **Auth & Security**  | Security + on-call    | Login success/failure, MFA challenges, rate-limit hits, suspicious-IP block rate |
| **Cost**             | Engineering leads     | Cloud spend by service, anomaly detection week-over-week                         |
| **SLO Burn**         | On-call + leadership  | Error budget remaining per SLO, burn rate, projection-to-empty                   |

The **Service Overview** dashboard is the on-call's home page. It must answer "is the system healthy right now?" in under five seconds.

---

## 4. Alert severity & routing

Severities match [incident-response.md](../confluence/incident-response.md). The alert system is the entry point to that process.

| Severity | Definition                                                                                                                                   | Channel                                                                  | Response time                                       |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------- |
| **P1**   | User-impacting outage or data risk. Examples: API error rate >5% for 5 min, checkout flow broken, data corruption detected, security breach. | PagerDuty page → primary on-call → escalate to secondary at 10 min unack | 5 min acknowledge, immediate response               |
| **P2**   | Degraded but functional. Examples: P95 latency 3× budget for 10 min, queue backlog growing, one region unhealthy.                            | PagerDuty low-urgency → on-call (no phone alarm)                         | 30 min during business, next business day off-hours |
| **P3**   | Worth a human eye but not urgent. Examples: cost anomaly, certificate expiring in 14 days, dependency vulnerability published.               | Slack `#alerts-warn`                                                     | Next business day, triaged in standup               |
| **Info** | FYI only, no human required.                                                                                                                 | Slack `#alerts-info` or dashboard annotations only                       | None                                                |

**Routing rule of thumb:** if it can wait until tomorrow morning, it is not P1. If it can wait a week, it is not P2.

---

## 5. Core alerts (the starter set)

These are deployed on day one. Names, thresholds, and runbook links must stay in sync with `infra/observability/alerts/`.

### API service

| Alert                        | Condition                                        | Severity | Runbook                              |
| ---------------------------- | ------------------------------------------------ | -------- | ------------------------------------ |
| `api_error_rate_high`        | 5xx rate > 1% over 5 min                         | P1       | `runbooks/api-error-spike.md`        |
| `api_latency_p95_high`       | P95 > 500ms for 10 min (budget: 200ms)           | P2       | `runbooks/api-slow.md`               |
| `api_availability_burn_fast` | SLO error budget burning at 14.4× (2% in 1 hour) | P1       | `runbooks/slo-burn.md`               |
| `api_availability_burn_slow` | SLO error budget burning at 6× (5% in 6 hours)   | P2       | `runbooks/slo-burn.md`               |
| `api_health_check_failing`   | `/ready` failing on > 1 instance for 2 min       | P1       | `runbooks/api-not-ready.md`          |
| `api_deploy_regressed`       | Error rate post-deploy > 2× pre-deploy baseline  | P1       | `runbooks/post-deploy-regression.md` |

### Database

| Alert                      | Condition                                  | Severity         | Runbook                       |
| -------------------------- | ------------------------------------------ | ---------------- | ----------------------------- |
| `db_connections_exhausted` | Active connections > 90% of pool for 5 min | P1               | `runbooks/db-connections.md`  |
| `db_replication_lag`       | Replica lag > 30s for 5 min                | P2               | `runbooks/db-replication.md`  |
| `db_slow_queries_spiking`  | Queries > 1s growing > 50% week-over-week  | P3               | `runbooks/db-slow-queries.md` |
| `db_disk_space`            | < 20% free                                 | P2 (P1 if < 10%) | `runbooks/db-disk.md`         |
| `db_backup_failed`         | Daily backup did not complete              | P2               | `runbooks/db-backup.md`       |

### Queues (BullMQ)

| Alert                     | Condition                                       | Severity | Runbook                      |
| ------------------------- | ----------------------------------------------- | -------- | ---------------------------- |
| `queue_backlog_growing`   | Waiting jobs > 1000 and increasing for 15 min   | P2       | `runbooks/queue-backlog.md`  |
| `queue_failed_jobs_spike` | Failed jobs > 50/min for 5 min                  | P1       | `runbooks/queue-failures.md` |
| `queue_dlq_nonzero`       | Any job in dead-letter queue                    | P2       | `runbooks/queue-dlq.md`      |
| `queue_worker_stalled`    | No job processed for 10 min on a non-idle queue | P2       | `runbooks/queue-stalled.md`  |

### Frontend (Web)

| Alert                 | Condition                              | Severity | Runbook                    |
| --------------------- | -------------------------------------- | -------- | -------------------------- |
| `web_error_rate_high` | Client error rate > 2% over 10 min     | P2       | `runbooks/web-errors.md`   |
| `web_lcp_regression`  | P75 LCP > 4s for 1 hour (budget: 2.5s) | P3       | `runbooks/web-perf.md`     |
| `web_js_bundle_size`  | Main bundle > 250KB gzipped on deploy  | P3       | `runbooks/bundle-bloat.md` |

### Security

| Alert                       | Condition                              | Severity            | Runbook                       |
| --------------------------- | -------------------------------------- | ------------------- | ----------------------------- |
| `auth_login_failures_spike` | Failed logins > 10× baseline for 5 min | P2                  | `runbooks/auth-attack.md`     |
| `auth_admin_action_unusual` | Admin action from new IP / new device  | P2                  | `runbooks/admin-anomaly.md`   |
| `secret_age_exceeded`       | Any secret older than rotation policy  | P3                  | `runbooks/secret-rotation.md` |
| `cert_expiring`             | TLS cert < 14 days from expiry         | P2 (P1 at < 3 days) | `runbooks/cert-renewal.md`    |

### Business signals

These are leading indicators that something user-impacting is wrong even when technical metrics look fine.

| Alert                   | Condition                                                         | Severity |
| ----------------------- | ----------------------------------------------------------------- | -------- |
| `signups_dropped`       | Signups/hour < 50% of trailing-7-day average                      | P2       |
| `payments_failure_rate` | Payment success rate < 95% over 15 min                            | P1       |
| `key_action_zero`       | Zero of a critical business event in 15 min during business hours | P2       |

---

## 6. SLOs we commit to

These mirror the NFRs in [overview.md](../architecture/overview.md). Burning the error budget is a signal to slow down, not a failure.

| SLO              | Target                                     | Window          | Error budget / 30d            |
| ---------------- | ------------------------------------------ | --------------- | ----------------------------- |
| API availability | 99.9% successful requests                  | 30 days rolling | ~43 min                       |
| API latency      | 95% of requests < 200ms                    | 30 days rolling | ~36 hours over budget allowed |
| Web availability | 99.95% (cached HTML served)                | 30 days rolling | ~22 min                       |
| Job processing   | 99% of jobs complete within SLA            | 30 days rolling | 1%                            |
| Payments         | 99.5% successful (excluding card declines) | 30 days rolling | ~3.5 hours                    |

**Error budget policy** (also in observability.md):

- **0–50% consumed:** Normal velocity. Ship features.
- **50–100% consumed:** Caution. New risky changes require approval from on-call lead.
- **>100% consumed:** Feature freeze on the affected surface until budget recovers. All hands on reliability.

---

## 7. Synthetic monitoring

We don't trust real user traffic alone — by the time it tells us something's broken, users already know. Synthetics run continuously from multiple regions:

| Probe                  | What it does                                               | Frequency | Severity if failing |
| ---------------------- | ---------------------------------------------------------- | --------- | ------------------- |
| Homepage load          | Fetch `/`, assert 200 + key DOM element                    | 1 min     | P1                  |
| API health             | Hit `/health` and `/ready`                                 | 1 min     | P1                  |
| Signup happy path      | Headless browser: signup → verify email mock → land in app | 5 min     | P1                  |
| Critical user journey  | Headless browser: login → primary user action → success    | 5 min     | P1                  |
| Payment flow (sandbox) | Test transaction against payment provider sandbox          | 15 min    | P2                  |

Synthetic failures from ≥ 2 regions = real outage. From 1 region only = investigate but don't page yet (could be the probe).

---

## 8. Log-based monitoring

Some things only show up in logs, not metrics. We treat structured log queries as first-class monitors.

| Log signal                   | Pattern                                              | Action                         |
| ---------------------------- | ---------------------------------------------------- | ------------------------------ |
| Unhandled exception          | `level=fatal` or untyped error reaching top of stack | P1 alert                       |
| Authorization denial spike   | `event=authz.deny` > 10/min on same user             | Security review                |
| Idempotency collision rate   | `event=idempotency.replay` > 5%                      | Investigate client retry storm |
| Migration ran in production  | `event=db.migration.applied`                         | Slack notification, not alert  |
| Feature flag toggled in prod | `event=feature_flag.changed`                         | Slack notification, not alert  |

---

## 9. Cost monitoring

Performance regressions and cost regressions deserve equal attention.

- **Daily** cloud-spend dashboard reviewed asynchronously by the platform lead.
- **Weekly** anomaly detection: alert if any service line-item is > 30% above its trailing 4-week average.
- **Per-deploy** budget check (where possible): if a deploy increases queries-per-request by > 20% it's flagged on the PR.
- **Quarterly** waste review: unused resources, oversized instances, stale snapshots, dangling load balancers.

---

## 10. On-call experience

The on-call dashboard is `#on-call` in Slack plus a single Grafana / Datadog page bookmarked as `https://obs.[domain]/on-call`. The page contains, in order:

1. **Current incidents** (auto-populated from PagerDuty)
2. **Service Overview** RED for API/Web/Workers
3. **Active alerts** (firing, not yet resolved)
4. **Deploys in last 24h** (timestamp + commit + author)
5. **Top 10 errors** (grouped by fingerprint, from Sentry)
6. **Links to runbooks**

If an on-call engineer cannot diagnose a P1 from this single page within 10 minutes, the page or the runbooks are broken — file an issue.

---

## 11. Reviewing this document

- **Monthly:** On-call lead reviews the alert noise report. Alerts that fired with no human action → deleted or downgraded.
- **Quarterly:** SLOs re-evaluated against business reality. Targets that are never burned are too lax; targets always burned are unrealistic.
- **After every P1:** The incident review (see [incident-response.md](../confluence/incident-response.md)) must answer "would a better alert have caught this sooner?" and update this document if yes.

---

## 12. Anti-patterns

- ❌ "Alert on everything; we'll filter later." → alert fatigue, on-call burnout, real signal missed.
- ❌ Thresholds based on round numbers (80% CPU) with no link to user impact.
- ❌ Alerts that fire only during business hours because "off-hours no one will respond." → either it matters always or it doesn't matter.
- ❌ Runbooks that say "investigate." Runbooks must contain concrete commands and decision trees.
- ❌ Dashboards edited in the UI without PR. Drift kills trust.
