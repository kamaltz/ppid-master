#!/bin/bash

# Local Build Update Script
# Builds from source and updates container

set -e

echo "🔨 PPID Master Local Build Update"

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

echo "💾 Creating backup..."
docker exec $(docker ps -q --filter name=postgres) pg_dump -U postgres ppid_garut > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql" 2>/dev/null || echo "⚠️ Backup failed"

echo "📥 Downloading latest source..."
if [ ! -d "ppid-master-source" ]; then
    git clone https://github.com/kamaltz/ppid-master.git ppid-master-source
else
    cd ppid-master-source && git pull && cd ..
fi

echo "🔨 Building new image..."
cd ppid-master-source
docker build -t ppid-master:latest .
cd ..

echo "🔄 Stopping old containers..."
docker stop $(docker ps -q --filter ancestor=ppid-master) 2>/dev/null || echo "No containers to stop"
docker rm $(docker ps -aq --filter ancestor=ppid-master) 2>/dev/null || echo "No containers to remove"

echo "🚀 Starting updated container..."
docker run -d \
    --name ppid-master-app-$(date +%s) \
    --network $(docker network ls --filter name=ppid --format "{{.Name}}" | head -1) \
    -p 3000:3000 \
    -v $(docker volume ls --filter name=uploads --format "{{.Name}}" | head -1):/app/public/uploads \
    -e DATABASE_URL="postgresql://postgres:postgres@$(docker ps --filter name=postgres --format "{{.Names}}" | head -1):5432/ppid_garut?schema=public" \
    -e JWT_SECRET="${JWT_SECRET:-your-secure-jwt-secret}" \
    -e NEXT_PUBLIC_API_URL="/api" \
    --restart unless-stopped \
    ppid-master:latest

echo "⏳ Waiting for startup..."
sleep 15

echo "✅ Update completed!"
docker ps --filter ancestor=ppid-master