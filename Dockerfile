# Base image
FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat postgresql-client curl
WORKDIR /app

# Dependencies
FROM base AS deps
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Builder
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build environment variables
ENV NODE_ENV=production
ENV SKIP_ENV_VALIDATION=true
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ppid_garut?schema=public"
ENV JWT_SECRET="build-time-secret"
ENV NEXT_PUBLIC_API_URL="/api"

# Generate Prisma client first
RUN npx prisma generate

# Build the application
RUN npm run build

# Runner - Final image
FROM base AS runner
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create uploads directory with proper permissions
RUN mkdir -p /app/public/uploads/images && chown -R nextjs:nodejs /app/public

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

COPY --chown=nextjs:nodejs start.sh ./
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./

# Set proper permissions
RUN chmod +x start.sh docker-entrypoint.sh && chown -R nextjs:nodejs /app

# Switch to nextjs user for security
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production

CMD ["./start.sh"]