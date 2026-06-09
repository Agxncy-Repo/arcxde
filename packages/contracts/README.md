# @app/contracts

Shared Zod schemas and inferred TypeScript types — the single source of truth between the API and any client.

See [ADR-0007](../../docs/adr/0007-shared-zod-contracts.md) for the rationale.

## Why this exists

Without a shared package, the same shape gets defined three times: in the backend's validation layer, in the frontend's form schema, and in TypeScript types between them. Drift is inevitable, and drift between request validators and form validators is one of the highest-leverage sources of "works on my machine" bugs.

With `@app/contracts`:

- API uses the schemas in the Zod validation pipe.
- Web app uses the schemas in `react-hook-form` (`zodResolver`).
- Both sides import the same `Organization`, `CreateOrganizationBody`, etc. types — `z.infer` ensures they cannot drift.

## Conventions

- Schemas live next to the domain they belong to: `organizations.ts`, `users.ts`, `billing.ts`.
- The `common.ts` file holds shared primitives (`idSchema`, `paginationQuerySchema`, `errorEnvelopeSchema`).
- Every exported schema has a matching `Type = z.infer<typeof Schema>`.
- IDs are prefixed CUIDs (`org_*`, `usr_*`) — use `idSchema('prefix')`.
- Emails are lowercased on parse.
- Optional fields are explicit; never default to `nullable()` unless the DB actually stores null.

## Adding a new domain

1. Create `src/<domain>.ts`.
2. Define request bodies, response shapes, and path/query params.
3. Export from `src/index.ts`.
4. Add unit tests under `src/<domain>.spec.ts` if there's non-trivial validation.

## Versioning

This package is internal — no semver. Breaking changes are propagated through the monorepo on the same PR.

When the API surfaces these schemas externally (OpenAPI), versioning happens at the API layer (`/api/v1`), not here.
