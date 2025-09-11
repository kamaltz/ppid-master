#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

log_info "Fixing PPID Master deployment issues..."

cd /opt/ppid

log_info "Stopping services..."
docker-compose down

log_info "Pulling latest image..."
docker-compose pull

log_info "Recreating containers with fresh environment..."
docker-compose up -d --force-recreate

log_info "Waiting for database to be ready..."
for i in {1..30}; do
    if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        log_info "Database is ready"
        break
    fi
    sleep 2
done

log_info "Regenerating Prisma client..."
docker-compose exec -T app npx prisma generate

log_info "Applying database migrations..."
docker-compose exec -T app npx prisma migrate deploy

log_info "Reseeding database..."
docker-compose exec -T app npx prisma db seed

log_info "Restarting application..."
docker-compose restart app

log_info "Waiting for application to be ready..."
for i in {1..60}; do
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        log_info "Application is ready"
        break
    fi
    if [ $i -eq 60 ]; then
        log_error "Application failed to start - showing logs..."
        docker-compose logs --tail=50 app
        exit 1
    fi
    sleep 3
done

log_info "Testing API endpoints..."
curl -f http://localhost:3000/api/settings > /dev/null 2>&1 && log_info "Settings API: OK" || log_warn "Settings API: Failed"
curl -f http://localhost:3000/api/auth/me > /dev/null 2>&1 && log_info "Auth API: OK" || log_warn "Auth API: Failed"

echo ""
log_info "Fix completed! Try accessing: https://167.172.83.55"
log_info "If issues persist, check logs: docker-compose logs app"