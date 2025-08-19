#!/bin/bash
set -e

# Fix API 500 errors - Raw GitHub version
# Usage: curl -fsSL https://raw.githubusercontent.com/your-repo/ppid-master/main/fix-api-errors.sh | bash

INSTALL_DIR="/opt/ppid"

echo "🔧 Fixing PPID API errors..."

# Navigate to install directory
if [ -d "$INSTALL_DIR" ]; then
    cd $INSTALL_DIR
else
    echo "❌ PPID not installed"
    exit 1
fi

# Stop services
echo "🛑 Stopping services..."
docker-compose down

# Start only database
echo "🗄️ Starting database..."
docker-compose up -d postgres

# Wait for database
echo "⏳ Waiting for database..."
for i in {1..30}; do
    if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        echo "✅ Database ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Database failed to start"
        exit 1
    fi
    sleep 2
done

# Check database tables
echo "🔍 Checking database..."
TABLES=$(docker-compose exec -T postgres psql -U postgres -d ppid_garut -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')

if [ "$TABLES" -lt 10 ]; then
    echo "⚠️ Missing tables, running migration..."
    docker-compose up -d app
    sleep 10
    docker-compose exec -T app npx prisma generate
    docker-compose exec -T app npx prisma migrate deploy
    docker-compose exec -T app npx prisma db seed
    docker-compose stop app
fi

# Start application
echo "🚀 Starting application..."
docker-compose up -d app

# Wait for application
echo "⏳ Waiting for application..."
for i in {1..60}; do
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        echo "✅ Application ready"
        break
    fi
    if [ $i -eq 60 ]; then
        echo "⚠️ Application may need manual check"
    fi
    sleep 2
done

# Test APIs
echo "🧪 Testing APIs..."
ERRORS=0

# Test health
if ! curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "❌ Health API failed"
    ERRORS=$((ERRORS + 1))
fi

# Test informasi
if ! curl -f http://localhost:3000/api/informasi > /dev/null 2>&1; then
    echo "❌ Informasi API failed"
    ERRORS=$((ERRORS + 1))
fi

# Test keberatan
if ! curl -f http://localhost:3000/api/keberatan > /dev/null 2>&1; then
    echo "❌ Keberatan API failed"
    ERRORS=$((ERRORS + 1))
fi

if [ $ERRORS -eq 0 ]; then
    echo "✅ All APIs working"
else
    echo "⚠️ $ERRORS API(s) still failing - check logs:"
    echo "docker-compose logs app"
fi

echo ""
echo "🔧 Fix completed!"
echo "🌐 URL: https://$(hostname -f)"
echo "📊 Health: curl https://$(hostname -f)/api/health"