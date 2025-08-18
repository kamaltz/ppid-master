# Base image
FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat postgresql-client
WORKDIR /app

# Dependencies
FROM base AS deps
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Builder
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Runner - Final image
FROM base AS runner
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/package.json ./package.json

COPY start.sh ./

# Mengubah kepemilikan semua file di /app ke pengguna nextjs
RUN chown -R nextjs:nodejs /app

USER root
RUN chmod +x start.sh
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production

CMD ["./start.sh"]