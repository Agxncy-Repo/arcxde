# @app/config

Shared TypeScript and ESLint configuration for the monorepo.

## Exports

| Path | Purpose |
|---|---|
| `@app/config/tsconfig.lib.json` | TS config for library packages under `packages/*` (composite project, declarations emitted) |
| `@app/config/tsconfig.node.json` | TS config for Node services under `apps/*` (CommonJS, incremental build) |
| `@app/config/eslint-base` | Shared ESLint rules (type-checked, import sorting, hygiene) |

## Usage

In a consumer `tsconfig.json`:

```json
{
  "extends": "@app/config/tsconfig.lib.json",
  "compilerOptions": { "outDir": "dist" }
}
```

In a consumer `.eslintrc.cjs`:

```js
module.exports = {
  root: true,
  extends: ['@app/config/eslint-base'],
  parserOptions: { tsconfigRootDir: __dirname, project: ['./tsconfig.json'] },
};
```

## Adding rules

Discuss in an ADR or eng-leads channel before adding new rules — this config affects every package.
