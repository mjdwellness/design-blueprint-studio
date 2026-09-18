# Builds and runs the TanStack Start app as a plain Node HTTP server —
# suitable for Azure Container Apps (or any container host). This bypasses
# the Cloudflare Workers build Lovable's own preview uses; see vite.config.ts
# for why that's safe (Lovable's sandbox build forces its own preset
# regardless of what's set here, so this doesn't affect the Lovable preview).

# ---- deps + build (Bun, matching this repo's committed bun.lock) ----
FROM oven/bun:1 AS build
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

# Vite inlines VITE_* variables into the client bundle at build time, so
# they have to be supplied as build args (not just runtime env vars) —
# none of these are secret, they're the same publishable values already in
# this repo's .env.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_PROJECT_ID
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY \
    VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID

RUN bun run build

# ---- runtime (small Node image, just the built server output) ----
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOST=0.0.0.0
COPY --from=build /app/.output ./.output
EXPOSE 3000
# The official Node image already ships a non-root "node" user.
USER node
CMD ["node", ".output/server/index.mjs"]
