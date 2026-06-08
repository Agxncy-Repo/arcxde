# Coding Standards

> **Maintainer:** All engineers
> **Last reviewed:** [DATE]

Standards are not preferences. They exist so reading other people's code feels like reading your own.

---

## 1. Language

- **TypeScript only** in app code. JavaScript allowed only in build scripts.
- **Strict mode** everywhere: `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitOverride: true`, `exactOptionalPropertyTypes: true`.
- **Node version** matches `engines` in root `package.json`. Don't use features beyond it.

---

## 2. No `any`. Almost never.

`any` is a request for a runtime bug.

- Use `unknown` and narrow.
- Use generics when you genuinely don't know the type.
- If you must use `any`, ESLint requires a `// eslint-disable-next-line @typescript-eslint/no-explicit-any -- reason` comment with a real reason.

---

## 3. Naming

| Thing               | Style                          | Example                     |
| ------------------- | ------------------------------ | --------------------------- |
| Files               | kebab-case                     | `billing.service.ts`        |
| Test files          | colocated, `.spec.ts`          | `billing.service.spec.ts`   |
| Classes             | PascalCase                     | `BillingService`            |
| Interfaces          | PascalCase, **no `I` prefix**  | `PaymentProvider`           |
| Types               | PascalCase                     | `OrderStatus`               |
| Functions / methods | camelCase, verb-led            | `createOrder`, `isExpired`  |
| Constants           | UPPER_SNAKE for true constants | `MAX_RETRIES`               |
| React components    | PascalCase, file matches       | `UserAvatar.tsx`            |
| Hooks               | `use` prefix                   | `useDashboardData`          |
| Booleans            | `is/has/can/should` prefix     | `isActive`, `hasPermission` |

**Avoid:**

- Abbreviations: `usr`, `cfg`, `mgr`. Type the extra letters.
- "Manager", "Helper", "Util" as suffixes. Be specific.
- Hungarian notation.

---

## 4. File structure

- One default export per file, max. Prefer named exports.
- Re-export from `index.ts` only when the package boundary needs it. No "barrel of barrels."
- Group related code in folders, not in 1000-line files. Split at ~300 lines.
- Tests live next to the code: `foo.ts` + `foo.spec.ts`.

---

## 5. Functions

- One thing. Short. If the function has an `&` in its mental description, it does two things.
- Max 4 parameters. Beyond that, pass an options object.
- Boolean parameters are a code smell. `setVisible(true)` is worse than `show()` / `hide()`.
- Pure where possible. Side effects at the edges.

---

## 6. Errors

- Throw typed errors (subclasses of `DomainError`). Don't throw strings.
- Catch only when you can do something meaningful. Don't catch-and-log-and-rethrow.
- Never `catch (e) { return null }`. Silent failures are the worst failures.
- `Result<T, E>` pattern is allowed in narrow contexts (parsers, validators) but not the default.

---

## 7. Comments

- Code says **what**, comments say **why**.
- Outdated comments are worse than no comments. Delete them.
- `TODO` / `FIXME` must include an owner and a date: `// TODO(alice, 2026-06): rework once X lands`.
- JSDoc on every exported function in shared packages. Internal functions: only when non-obvious.

---

## 8. Imports

Order — enforced by ESLint `import/order`:

1. Node built-ins (`node:fs`, etc.)
2. External packages
3. Internal packages (`@[project]/*`)
4. Parent-relative (`../`)
5. Same-folder (`./`)
6. Side-effect imports
7. Type-only imports (`import type`)

Always use `import type` for type-only imports — keeps runtime bundle clean.

---

## 9. Async

- `async/await` everywhere. No raw `.then()` chains except in tooling.
- Don't `await` inside a `forEach` — use `for...of` or `Promise.all`.
- Always handle promise rejection. ESLint `no-floating-promises` is on.
- Pass abort signals when calling cancellable operations.

---

## 10. Immutability

- Prefer `const`. `let` only when reassignment is genuinely needed.
- Don't mutate function arguments.
- Treat input objects as `Readonly<T>` unless you own them.
- Spread / structuredClone over manual deep clones.

---

## 11. Backend specifics

- Controllers are **thin** — validate, call service, shape response.
- Services don't reach into other modules' Prisma queries.
- Repositories return domain types, not Prisma types, when the leak would be wide.
- All DB writes inside a service method are in one transaction or zero.
- All cross-process effects (email, webhook) happen after the transaction commits.

---

## 12. Frontend specifics

- Server Components are the default. `'use client'` requires interactivity.
- No data fetching in `useEffect`. Use Server Components, route handlers, or TanStack Query.
- No inline functions in JSX for performance-critical lists — use `useCallback` / hoist.
- Keys on lists must be stable IDs, not array indices.
- No `dangerouslySetInnerHTML` without DOMPurify and a code-review comment.
- Tailwind classes are organized: layout → box → typography → color → state. Use Prettier Tailwind plugin to enforce.

---

## 13. Logging

- Structured: `logger.info({ event, ...fields }, 'message')`.
- No `console.log` in app code (ESLint rule). Reserved for tests and scripts.
- Never log secrets, tokens, full request bodies on auth endpoints. Redaction is enforced but don't rely on it.

---

## 14. Configuration

- All config goes through the typed config service. No `process.env.X` scattered.
- Defaults documented in the Zod schema. No silent fallbacks.

---

## 15. Tests

- Tests are first-class code. Same lint and review standards.
- One behavior per test. Title reads as a sentence: `it('rejects expired tokens', ...)`.
- AAA: Arrange, Act, Assert — visible in the structure.
- No mocking of code you own when an integration test would be fast enough.
- See [Testing Strategy](./testing.md).

---

## 16. Tooling

| Tool                | Role                        |
| ------------------- | --------------------------- |
| TypeScript          | Type checking               |
| ESLint              | Lint, style, rules          |
| Prettier            | Format                      |
| pnpm                | Package management          |
| Turborepo           | Build orchestration + cache |
| lint-staged + Husky | Pre-commit hooks            |
| commitlint          | Commit message format       |

Pre-commit runs: lint-staged → Prettier + ESLint --fix → typecheck on changed files. Pre-push runs: full type check.

---

## 17. Pull request standards

- One concern per PR. If you can't summarize it in one sentence, split it.
- PR template auto-fills. Don't skip checkboxes.
- Linked issue, screenshots/recordings for UI changes, migration plan for DB changes.
- CI must pass. No "merge anyway" except by tech lead approval with a written reason.

---

## 18. Things we don't do

- We don't add libraries without a reason. New dependency → PR description must justify it.
- We don't keep dead code. Delete it; Git remembers.
- We don't commit commented-out code. Delete or extract behind a feature flag.
- We don't push directly to `main`. Always via PR.
- We don't merge with a red CI.
