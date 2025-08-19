#!/bin/bash
set -e

# Import ppid_db.sql script
INSTALL_DIR="/opt/ppid"

echo "📥 Importing ppid_db.sql..."

# Navigate to install directory
if [ -d "$INSTALL_DIR" ]; then
    cd $INSTALL_DIR
else
    echo "❌ PPID not installed"
    exit 1
fi

# Check for ppid_db.sql
if [ ! -f "ppid_db.sql" ]; then
    echo "❌ ppid_db.sql not found in $INSTALL_DIR"
    exit 1
fi

# Stop application
echo "🛑 Stopping application..."
docker-compose stop app

# Backup current database
echo "💾 Creating backup..."
mkdir -p backups
docker-compose exec -T postgres pg_dump -U postgres -d ppid_garut > "backups/backup_$(date +%Y%m%d_%H%M%S).sql"

# Import database
echo "📥 Importing ppid_db.sql..."
docker-compose exec -T postgres psql -U postgres -d ppid_garut < ppid_db.sql

# Update Prisma
echo "🔄 Updating Prisma..."
docker-compose exec -T app npx prisma generate
docker-compose exec -T app npx prisma db push --accept-data-loss

# Start application
echo "🚀 Starting application..."
docker-compose start app

echo "✅ Import completed!"