# ─────────────────────────────────────────────
#  Stage 1 – Dependencies
# ─────────────────────────────────────────────
FROM node:22-alpine AS deps

# Install pnpm (the project uses pnpm-lock.yaml)
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package manifests only (for better layer caching)
COPY package.json pnpm-lock.yaml ./

# Approve build scripts needed by esbuild, @swc/core, etc.
RUN pnpm install --frozen-lockfile --config.confirmModulesPurge=false \
    && pnpm approve-builds --all 2>/dev/null || true

# ─────────────────────────────────────────────
#  Stage 2 – Development server
# ─────────────────────────────────────────────
FROM node:22-alpine AS dev

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Bring in installed node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy full source code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Increase Node memory for heavy compilation (Monaco, etc.)
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV HOST=0.0.0.0

# Use -- to properly pass --host flag through pnpm to vite
CMD ["pnpm", "exec", "vite", "--host", "0.0.0.0", "--port", "5173"]

