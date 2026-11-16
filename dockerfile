
# =========================================
# CHICKY LICKY - BUILD IMAGE
# Node 22 + Next.js 16 + Prisma 6 + MySQL
# =========================================

FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Prisma cần OpenSSL trong môi trường Linux
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# Cài dependencies theo package-lock.json
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js production
RUN npm run build


# =========================================
# RUNTIME IMAGE
# =========================================

FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# Next.js standalone runtime
COPY --from=builder /app/.next/standalone ./

# Copy đầy đủ dependencies để Prisma CLI có thể chạy db push
COPY --from=builder /app/node_modules ./node_modules

# Static assets
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Prisma schema
COPY --from=builder /app/prisma ./prisma

# Startup script
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh \
    && chown -R node:node /app

USER node

EXPOSE 3000

CMD ["./docker-entrypoint.sh"]
