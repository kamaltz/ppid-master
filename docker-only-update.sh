#!/bin/bash

# Docker-only Update (No docker-compose)
# For systems where docker-compose has issues

set -e

echo "🐳 Docker-only PPID Master Update"

# Configuration
IMAGE_NAME="ppid-master"
CONTAINER_NAME="ppid-master-app"
NETWORK_NAME="ppid-master_default"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

echo "💾 Creating database backup..."
docker exec ppid-master-postgres-1 pg_dump -U postgres ppid_garut > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql" 2>/dev/null || echo "⚠️ Backup failed"

echo "📦 Pulling latest image..."
docker pull $IMAGE_NAME:latest

echo "🔄 Stopping application..."
docker stop $CONTAINER_NAME-1 2>/dev/null || docker stop $(docker ps -q --filter ancestor=$IMAGE_NAME) 2>/dev/null || echo "No container running"

echo "🗑️ Removing old container..."
docker rm $CONTAINER_NAME-1 2>/dev/null || docker rm $(docker ps -aq --filter ancestor=$IMAGE_NAME) 2>/dev/null || echo "No container to remove"

echo "🚀 Starting new container..."
docker run -d \
    --name $CONTAINER_NAME-1 \
    --network $NETWORK_NAME \
    -p 3000:3000 \
    -v ppid-master_uploads:/app/public/uploads \
    -e DATABASE_URL="postgresql://postgres:postgres@ppid-master-postgres-1:5432/ppid_garut?schema=public" \
    -e JWT_SECRET="your-jwt-secret" \
    -e NEXT_PUBLIC_API_URL="/api" \
    --restart unless-stopped \
    $IMAGE_NAME:latest

echo "⏳ Waiting for startup..."
sleep 15

echo "🔍 Checking status..."
docker ps | grep $IMAGE_NAME

echo "✅ Update completed!"
echo "🌐 Application: http://localhost:3000"