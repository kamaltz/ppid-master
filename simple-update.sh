#!/bin/bash

# Simple Update Script
# Uses existing container configuration

set -e

echo "🚀 Simple PPID Master Update"

# Configuration
DOCKERHUB_USERNAME="${DOCKERHUB_USERNAME:-kamaltz}"
IMAGE_NAME="${DOCKERHUB_USERNAME}/ppid-master"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

echo "💾 Creating backup..."
docker exec ppid-postgres-1 pg_dump -U postgres ppid_garut > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql" 2>/dev/null || echo "⚠️ Backup failed"

echo "📦 Pulling latest image..."
if ! docker pull $IMAGE_NAME:latest; then
    echo "❌ Pull failed. Please check image name or build locally."
    exit 1
fi

echo "🔄 Stopping existing container..."
docker stop ppid-app-1 2>/dev/null || echo "Container not running"
docker rm ppid-app-1 2>/dev/null || echo "Container not found"

echo "🚀 Starting updated container..."
docker run -d \
    --name ppid-app-1 \
    --network ppid_default \
    -p 127.0.0.1:3000:3000 \
    -v /opt/ppid/uploads:/app/public/uploads \
    -e DATABASE_URL="postgresql://postgres:postgres@ppid-postgres-1:5432/ppid_garut?schema=public" \
    -e JWT_SECRET="${JWT_SECRET:-your-secure-jwt-secret}" \
    -e NEXT_PUBLIC_API_URL="/api" \
    --restart unless-stopped \
    $IMAGE_NAME:latest

echo "⏳ Waiting for startup..."
sleep 15

echo "🔍 Checking status..."
docker ps --filter name=ppid-app

echo "✅ Update completed!"
echo "🌐 Application: http://localhost:3000"