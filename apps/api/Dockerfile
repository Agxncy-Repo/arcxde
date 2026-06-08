# =============================================================================
# apps/api — production Dockerfile.
#
# Multi-stage build:
#   1. deps         — install all dependencies (including dev) for building
#   2. builder      — compile TS, generate Prisma client
#   3. runtime      — minimal image, non-root, only what's needed to run
#
# Build context = monorepo root. Build with:
#   docker build -f apps/api/Dockerfile -t project-api:local .
# =============================================================================

# ---- 1. Dependencies ----
FROM node:22-alpine AS deps
WORKDIR /repo

# Enable pnpm via Corepack
RUN corepack enable

# Copy only what's needed to install
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc* ./
COPY apps/api/package.json apps/api/
COPY packages/config/package.json packages/config/
COPY packages/contracts/package.json packages/contracts/
COPY packages/utils/package.json packages/utils/

RUN pnpm install --frozen-lockfile --config.dedupe-peer-dependents=false

# ---- 2. Builder ----
FROM node:22-alpine AS builder
WORKDIR /repo
RUN corepack enable

COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /repo/packages ./packages

# Now copy source
COPY . .

# Generate Prisma client (uses apps/api/prisma/schema.prisma)
RUN pnpm --filter @app/api db:generate

# Build the packages this app depends on, then the app
RUN pnpm --filter @app/contracts --filter @app/utils build
RUN pnpm --filter @app/api build

# Strip dev deps to slim the next stage
RUN pnpm --filter @app/api --prod deploy --legacy /out

# ---- 3. Runtime ----
FROM node:22-alpine AS runtime
WORKDIR /app

# Security: non-root user, no shell
RUN addgroup -S app && adduser -S app -G app
USER app

ENV NODE_ENV=production \
    NODE_OPTIONS="--enable-source-maps" \
    API_HOST=0.0.0.0 \
    API_PORT=3001

COPY --from=builder --chown=app:app /out/node_modules ./node_modules
COPY --from=builder --chown=app:app /out/dist ./dist
COPY --from=builder --chown=app:app /repo/apps/api/prisma ./prisma

EXPOSE 3001

# Health check piggybacks on the /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3001/health || exit 1

# Graceful shutdown: tini handles signals so SIGTERM reaches Node directly
# (Node 22 handles it well without tini for most cases; uncomment if needed)
# ENTRYPOINT ["/sbin/tini", "--"]

CMD ["node", "dist/main.js"]
