# Build context: repo root (needs workspace packages + bun.lock).
FROM oven/bun:1.4.0-alpine AS build
WORKDIR /app
COPY . .
RUN --mount=type=cache,target=/root/.bun/install/cache bun install --frozen-lockfile
WORKDIR /app/apps/api
RUN bun run build

# `bun build` bundles every dependency into dist/index.js, so no node_modules at runtime.
FROM oven/bun:1.4.0-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/api/dist ./
USER bun
EXPOSE 4000
CMD ["bun", "index.js"]
