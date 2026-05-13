# ADR-0004: Next.js (App Router) for the frontend

- **Status:** Accepted
- **Date:** [DATE]
- **Deciders:** Frontend engineers
- **Tags:** frontend, framework

---

## Context

We need a React framework that:
- Renders fast on first load (SEO + LCP matter for the marketing surface).
- Supports both a public marketing site and an authenticated app from one codebase.
- Has first-class TypeScript support.
- Allows server-side data fetching with credentialed requests without leaking tokens to the client.
- Is hireable — engineers should know it day one.

## Decision

We will use **Next.js 14+ with the App Router**, deployed on [Vercel / self-hosted Node].

- React Server Components by default.
- Client Components only where interactivity demands.
- Tailwind CSS + Radix primitives (shadcn-style) for UI.
- TanStack Query for client-side data.
- Forms via react-hook-form + Zod.

## Consequences

### Positive
- Streaming SSR + RSC produce excellent perceived performance.
- One codebase for marketing + app, with route groups separating concerns.
- Server-side auth via HTTP-only cookies stays on the server; client never holds tokens.
- Massive talent pool and ecosystem.

### Negative
- App Router has sharp edges (caching defaults, server/client boundary errors) — requires team training.
- Hosting on non-Vercel platforms requires more work (custom server, image optimizer setup).
- Lock-in to Next.js conventions; portability to vanilla React is a multi-week project.

### Neutral
- We commit to keeping marketing pages mostly static (ISR/SSG) and the app shell dynamic.

## Alternatives considered

### Remix
- Pros: clean data loading model, web-standards-aligned, excellent forms story.
- Cons: smaller ecosystem, less alignment with our deployment options.
- Verdict: a close second. Chose Next.js for ecosystem and team familiarity.

### Vite + React + SPA
- Pros: simplest mental model, fast dev.
- Cons: no SSR (bad for marketing SEO/LCP), auth-token-on-the-client patterns lead to XSS exposure.
- Verdict: rejected for the main app.

### Astro (for marketing) + separate app
- Pros: best-in-class for content sites.
- Cons: two codebases, duplicated UI primitives.
- Verdict: rejected. Single codebase wins until content needs outgrow Next.js's static capabilities.

## References

- [Frontend Architecture](../architecture/frontend.md)
