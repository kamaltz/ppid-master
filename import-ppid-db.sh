#!/bin/bash
set -e

echo "📥 Importing ppid_db.sql..."

# Check for ppid_db.sql in current directory
if [ ! -f "ppid_db.sql" ]; then
    echo "❌ ppid_db.sql not found in current directory"
    echo "Please ensure ppid_db.sql is in $(pwd)"
    exit 1
fi

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml not found. Are you in the PPID directory?"
    exit 1
fi

# Start services if not running
echo "🚀 Starting services..."
docker-compose up -d

# Wait for postgres
echo "⏳ Waiting for database..."
for i in {1..30}; do
    if docker-compose exec -T postgres pg_isready -U ppid_user > /dev/null 2>&1; then
        break
    fi
    sleep 2
done

# Stop application only
echo "🛑 Stopping application..."
docker-compose stop app

# Backup current database
echo "💾 Creating backup..."
mkdir -p backups
docker-compose exec -T postgres pg_dump -U ppid_user -d ppid_garut > "backups/backup_$(date +%Y%m%d_%H%M%S).sql"

# Import database
echo "📥 Importing ppid_db.sql..."
docker-compose exec -T postgres psql -U ppid_user -d ppid_garut < ppid_db.sql

# Update Prisma
echo "🔄 Updating Prisma..."
docker-compose exec -T app npx prisma generate
docker-compose exec -T app npx prisma db push --accept-data-loss

# Start application
echo "🚀 Starting application..."
docker-compose start app

echo "✅ Import completed!"