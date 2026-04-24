# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Generate Prisma client, then build (vite CSS + tsup bundle)
RUN npx prisma generate && npm run build

# Stage 2: Production
FROM node:22-alpine AS runner

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Copy built app (includes dist/views and dist/public via tsup onSuccess)
COPY --from=builder /app/dist ./dist

# Copy prisma schema + migrations for `prisma migrate deploy`
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 3636

ENTRYPOINT ["./docker-entrypoint.sh"]
