# Build context: repo root (needs workspace packages + bun.lock).
FROM node:22-alpine AS build
# NOTE: bun only installs and drives the build; Next runs on Node, its supported runtime.
COPY --from=oven/bun:1.4.0-alpine /usr/local/bin/bun /usr/local/bin/bun
WORKDIR /app
COPY . .
RUN --mount=type=cache,target=/root/.bun/install/cache bun install --frozen-lockfile
WORKDIR /app/apps/dashboard
RUN bun run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3001
COPY --from=build --chown=node:node /app/apps/dashboard/.next/standalone ./
COPY --from=build --chown=node:node /app/apps/dashboard/.next/static ./apps/dashboard/.next/static
USER node
EXPOSE 3001
CMD ["node", "apps/dashboard/server.js"]
