# @app/utils

Small, dependency-free utilities shared across the monorepo.

## What's here

| Module   | Purpose                                                  |
| -------- | -------------------------------------------------------- |
| `result` | `Result<T, E>` discriminated union for expected failures |
| `async`  | `sleep`, `retry` with exponential backoff and jitter     |

## What's NOT here

- Anything domain-specific. That goes in `apps/` or a domain package.
- Anything depending on Node, NestJS, browser globals, or any third-party library beyond what's already in here. Keep this package portable.
- Anything Zod-related. Schemas live in `@app/contracts`.

## When to add to this package

The rule of thumb: a utility ends up here only after the third place needs it. Before that, inline it where it's used and accept the duplication.
