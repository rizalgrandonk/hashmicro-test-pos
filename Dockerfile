# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Generate Prisma client (dummy URL satisfies prisma.config.ts env() check at build time)
# then build (vite CSS + tsup bundle)
RUN DATABASE_URL=postgresql://dummy:dummy@dummy:5432/dummy npx prisma generate && npm run build

# Stage 2: Production
FROM node:22-alpine AS runner

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm install --no-save tsx

# Copy built app (includes dist/views and dist/public via tsup onSuccess)
COPY --from=builder /app/dist ./dist

# Copy generated Prisma client — needed by tsx-executed scripts (e.g. db:seed)
# that import directly from src/generated/prisma/client, not from the built dist
COPY --from=builder /app/src/generated ./src/generated

# Copy prisma schema + migrations for `prisma migrate deploy`
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 3636

ENTRYPOINT ["./docker-entrypoint.sh"]
