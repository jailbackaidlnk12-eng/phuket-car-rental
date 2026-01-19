# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application (Client + Server)
RUN pnpm build

# Production Stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy built artifacts and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
# We need node_modules for production dependencies (or we could prune devDeps)
COPY --from=builder /app/node_modules ./node_modules
# Copy data directory structure (but not content if mounted)
COPY --from=builder /app/client/public ./client/public
# Note: In the build script, we might verify if client/dist is needed or if it's embedded in server.
# Checking package.json: "build": "vite build && esbuild ..."
# Vite build output goes to client/dist typically.
# Server often serves from there.
# Let's double check where server serves static files.
# server/_core/index.ts: serveStatic(app) -> usually serves client/dist
# But let's copy the whole built structure to be safe.
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/uploads ./uploads

# Create data directory
RUN mkdir -p data

ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/app/data/mirin.db

EXPOSE 3000

CMD ["npm", "start"]
