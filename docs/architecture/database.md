# Database & Prisma

> **Maintainer:** Backend Team
> **Last reviewed:** [DATE]
> **Status:** Living document

---

## 1. Goals

1. **Correctness** — schema constraints prevent invalid states.
2. **Performance** — every query touches an index; no full scans on hot tables.
3. **Evolvability** — migrations are safe to deploy with zero downtime.
4. **Auditability** — every important state change leaves a trail.

---

## 2. Why PostgreSQL + Prisma

**PostgreSQL** because:

- ACID transactions across all data — no eventual-consistency headaches.
- JSONB for flexible fields where useful, structured columns otherwise.
- Full-text search, partial indexes, expression indexes — enough to delay specialized stores.
- Logical replication and PITR — proven DR story.
- Hugely portable across managed providers.

**Prisma** because:

- End-to-end TypeScript types.
- Migration system that's actually pleasant.
- Generator ecosystem (Zod, OpenAPI, ERD).
- Escape hatch via `$queryRaw` when needed.

See [ADR-0005: PostgreSQL + Prisma](../adr/0005-postgresql-prisma.md).

---

## 3. Schema Conventions

### 3.1 Identifiers

- **All IDs are prefixed CUIDs** (or KSUIDs): `usr_abc123...`, `org_xyz789...`.
  - Sortable, opaque, URL-safe.
  - Prefix makes IDs self-describing in logs.
- Foreign keys are explicit columns: `userId`, not `user_id` (Prisma maps via `@map`).

```prisma
model User {
  id        String   @id @default(dbgenerated("'usr_' || gen_random_uuid()"))
  // or with cuid() / a custom helper
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 3.2 Required columns on every table

| Column      | Type                 | Purpose                                                                 |
| ----------- | -------------------- | ----------------------------------------------------------------------- |
| `id`        | text (prefixed CUID) | Primary key                                                             |
| `createdAt` | timestamptz          | Insert audit                                                            |
| `updatedAt` | timestamptz          | Update audit (Prisma `@updatedAt`)                                      |
| `deletedAt` | timestamptz?         | Soft delete (only when soft delete is needed — most tables hard delete) |

### 3.3 Naming

- **Tables:** `PascalCase` in Prisma; `snake_case` in DB via `@@map`.
- **Columns:** `camelCase` in Prisma; `snake_case` in DB via `@map`.
- **Indexes:** name them — `@@index([userId, createdAt], name: "Order_userId_createdAt_idx")`.
- **Enums:** `PascalCase` for the enum name, `UPPER_SNAKE` for values.

### 3.4 Nullability

- **Default to NOT NULL.** Make a column nullable only when "unknown" is a real state distinct from "empty."
- Use defaults (`DEFAULT now()`, `DEFAULT ''`) instead of nullable when "no value yet" is acceptable.

### 3.5 Enums vs lookup tables

- **Enum** when values change rarely and are referenced in code (e.g., `Status`).
- **Lookup table** when values are user-editable or carry metadata.

### 3.6 Money

- **Never `float`/`double` for money.** Use `Decimal` (Postgres `NUMERIC(18, 4)`).
- Or store in **minor units** as `BigInt` (cents, kobo, etc.) — pick one convention and document it.

### 3.7 Timestamps

- **Always `timestamptz`** (Prisma `DateTime`).
- Store in UTC; convert at the edges.

---

## 4. Sample Schema (illustrative)

```prisma
generator client {
  provider = "prisma-client-js"
  // performance: tighter binary, fewer features at runtime
  // engineType = "binary"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Organization {
  id        String   @id @default(dbgenerated("'org_' || replace(gen_random_uuid()::text,'-','')"))
  name      String
  slug      String   @unique
  plan      Plan     @default(FREE)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  members   Membership[]
  @@map("organizations")
}

model User {
  id            String   @id @default(dbgenerated("'usr_' || replace(gen_random_uuid()::text,'-','')"))
  email         String   @unique
  emailVerified DateTime?
  passwordHash  String
  name          String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  memberships   Membership[]

  @@index([createdAt])
  @@map("users")
}

model Membership {
  id             String   @id @default(dbgenerated("'mbr_' || replace(gen_random_uuid()::text,'-','')"))
  userId         String
  organizationId String
  role           Role     @default(MEMBER)
  createdAt      DateTime @default(now())

  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@unique([userId, organizationId])
  @@index([organizationId])
  @@map("memberships")
}

enum Plan { FREE STARTER PRO ENTERPRISE }
enum Role { OWNER ADMIN MEMBER VIEWER }
```

---

## 5. Indexing Strategy

### 5.1 Always indexed

- Foreign keys (Prisma doesn't auto-create the index — add it).
- Columns used in `WHERE` on hot queries.
- Columns used in `ORDER BY` on paginated lists (often a composite with the filter column).

### 5.2 Composite indexes

- Order matters: most selective column first if filters are independent; otherwise put the equality filter first and range filter second.
- Example: list orders for a user, newest first → `@@index([userId, createdAt(sort: Desc)])`.

### 5.3 Partial indexes

- For "hot subset" queries — e.g., active sessions only:
  ```sql
  CREATE INDEX session_active_idx ON sessions(user_id) WHERE expires_at > now();
  ```

### 5.4 Expression indexes

- For case-insensitive lookups:
  ```sql
  CREATE UNIQUE INDEX users_email_lower_idx ON users (lower(email));
  ```

### 5.5 Don't over-index

- Every index slows writes. Audit unused indexes quarterly:
  ```sql
  SELECT * FROM pg_stat_user_indexes WHERE idx_scan = 0;
  ```

---

## 6. Migrations

### 6.1 Tooling

- `prisma migrate dev` in development.
- `prisma migrate deploy` in CI/CD for staging/production.
- Generated SQL is **reviewed in PR**, not just the schema diff.

### 6.2 Zero-downtime rules

Every migration must be safe to run while old code is still serving traffic.

**Adding a column**

- Add as nullable OR with a default.
- Backfill in a separate migration if needed.
- Make NOT NULL only after all rows have a value.

**Renaming a column**

- ❌ Never rename in place.
- ✅ Three-step: add new column, dual-write, backfill, switch reads, drop old. Each step is a separate deploy.

**Dropping a column**

- Step 1: stop writing to it in code, deploy.
- Step 2: drop in a later migration once you're confident nothing reads it.

**Index creation on large tables**

- Use `CREATE INDEX CONCURRENTLY` (manual SQL migration; Prisma supports this via raw `--create-only` workflow).

**Destructive changes**

- Require an ADR. No exceptions.

### 6.3 Migration review checklist (in PR template)

- [ ] Backward compatible with the previous code version
- [ ] Tested against a copy of staging data (or representative volume)
- [ ] No blocking locks on tables > 1M rows
- [ ] Has a documented rollback path

---

## 7. Seeding

- `prisma/seed.ts` produces a usable development DB.
- Idempotent — `upsert` everything, no truncations except where intentional.
- **Never run seed against production.** Guarded by `NODE_ENV` check.

---

## 8. Soft Deletes — Use Sparingly

Default: hard delete.

Soft delete only when:

- Legal / compliance requires retention.
- Recovery UX is part of the product ("Trash" / "Restore").
- Downstream systems hold references.

When soft-deleting:

- Use `deletedAt` (nullable timestamp), not a boolean.
- All queries must filter `deletedAt: null` — extract a Prisma extension or middleware to enforce.
- Foreign keys: prefer `ON DELETE SET NULL` or `RESTRICT` over `CASCADE` on soft-deleted parents.

---

## 9. Audit Trails

For sensitive entities (orders, permissions, money), keep an append-only audit log:

```prisma
model AuditLog {
  id          String   @id @default(dbgenerated("'aud_' || replace(gen_random_uuid()::text,'-','')"))
  actorId     String?
  actorType   String   // 'user' | 'system' | 'api'
  action      String   // 'order.created', 'user.role.changed'
  resourceId  String
  resourceType String
  before      Json?
  after       Json?
  metadata    Json?
  createdAt   DateTime @default(now())

  @@index([resourceType, resourceId, createdAt])
  @@index([actorId, createdAt])
  @@map("audit_logs")
}
```

Written from a single `AuditService` — never inline.

---

## 10. Connections & Pooling

- Use **PgBouncer** (transaction pooling) in front of Postgres.
- Prisma connection string includes `?pgbouncer=true&connection_limit=1` when going through PgBouncer.
- For serverless deployments: use Prisma's Data Proxy or Neon's pooler.

Sizing:

```
total_connections ≈ (api_instances × connection_limit) + (workers × worker_connections) + headroom
```

Stay below Postgres `max_connections` with at least 30% headroom.

---

## 11. Read Replicas

```typescript
// infrastructure/prisma/prisma.service.ts
@Injectable()
export class PrismaService {
  readonly primary: PrismaClient;
  readonly replica: PrismaClient;

  constructor() {
    this.primary = new PrismaClient({ datasourceUrl: config.DATABASE_URL });
    this.replica = new PrismaClient({ datasourceUrl: config.DATABASE_REPLICA_URL });
  }
}
```

Rule: writes and read-after-write → primary. Heavy reads, analytics, list endpoints not affected by replica lag → replica.

---

## 12. Common Performance Pitfalls

| Pitfall                                         | Fix                                           |
| ----------------------------------------------- | --------------------------------------------- |
| N+1 in `findMany` + nested loops                | Use `include` / `select` or DataLoader        |
| Wide `select *` returning JSONB blobs           | Project only needed fields                    |
| `findMany` without `take`                       | Always paginate                               |
| Offset pagination on large tables               | Cursor pagination (`cursor` + `take`)         |
| `where: { foo: { in: [...10000 ids] } }`        | Batch in chunks of ~500                       |
| `count()` on huge tables                        | Cache it; use `EXPLAIN` to confirm cost       |
| Stringly-typed JSON queries                     | Prefer structured columns + indexes           |
| Holding open transactions during external calls | Never. Do external calls outside transactions |

---

## 13. Query Patterns

### 13.1 Cursor pagination

```typescript
async listOrders({ userId, cursor, limit = 20 }: ListInput) {
  return this.prisma.order.findMany({
    where: { userId },
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: 'desc' },
    select: { id: true, total: true, status: true, createdAt: true },
  });
}
```

### 13.2 Transactional consistency

```typescript
await prisma.$transaction(
  async (tx) => {
    const order = await tx.order.create({ data });
    await tx.inventory.update({ where: { id }, data: { quantity: { decrement: 1 } } });
  },
  { isolationLevel: 'Serializable', timeout: 5000 },
);
```

Use `Serializable` only when correctness demands it (money, inventory). Default is `ReadCommitted`.

---

## 14. Backups & DR

- Daily logical backups (`pg_dump`) retained 30 days.
- Continuous WAL archiving (PITR) — RPO **5 minutes**.
- Restore drill **quarterly** in a clean environment. If it's not tested, it doesn't work.
- Backups are encrypted at rest; access audit-logged.

---

## 15. Local Development

`docker-compose.yml` runs Postgres 16 + Redis 7. Data persists in a named volume so you don't lose state between sessions. Reset with:

```bash
pnpm db:reset   # drops volume, re-runs migrations, seeds
```

---

## 16. References

- [System Overview](./overview.md)
- [Backend Architecture](./backend.md)
- [ADR-0005: PostgreSQL + Prisma](../adr/0005-postgresql-prisma.md)
- [Performance Playbook](../operations/performance.md)
