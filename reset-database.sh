#!/bin/bash
set -e

# Reset database completely - Raw GitHub version
# Usage: curl -fsSL https://raw.githubusercontent.com/your-repo/ppid-master/main/reset-database.sh | bash

INSTALL_DIR="/opt/ppid"

echo "🔄 Resetting PPID database..."

cd $INSTALL_DIR

# Stop services
echo "🛑 Stopping services..."
docker-compose down

# Remove database volume
echo "🗑️ Removing database..."
docker volume rm ppid_postgres_data 2>/dev/null || true

# Start services
echo "🚀 Starting fresh services..."
docker-compose up -d

# Wait for database
echo "⏳ Waiting for database..."
for i in {1..60}; do
    if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        break
    fi
    if [ $i -eq 60 ]; then
        echo "❌ Database failed"
        exit 1
    fi
    sleep 2
done

# Setup database
echo "🔧 Setting up database..."
docker-compose exec -T app npx prisma generate
docker-compose exec -T app npx prisma migrate deploy
docker-compose exec -T app npx prisma db seed

# Restart app
docker-compose restart app

echo "✅ Database reset complete!"
echo "👤 Admin: admin@garut.go.id / Garut@2025?"