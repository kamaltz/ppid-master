#!/bin/bash

# Production Update Script
# Uses correct Docker Hub image or builds locally

set -e

echo "🚀 PPID Master Production Update"

# Configuration - Update these with your actual values
DOCKERHUB_USERNAME="${DOCKERHUB_USERNAME:-kamaltz}"
IMAGE_NAME="${DOCKERHUB_USERNAME}/ppid-master"
CONTAINER_NAME="ppid-master-app"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

echo "💾 Creating backup..."
docker exec $(docker ps -q --filter name=postgres) pg_dump -U postgres ppid_garut > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql" 2>/dev/null || echo "⚠️ Backup failed"

echo "📦 Pulling latest image from Docker Hub..."
if ! docker pull $IMAGE_NAME:latest; then
    echo "⚠️ Pull failed, trying to build locally..."
    if [ -f "Dockerfile" ]; then
        echo "🔨 Building image locally..."
        docker build -t $IMAGE_NAME:latest .
    else
        echo "❌ No Dockerfile found and pull failed"
        exit 1
    fi
fi

echo "🔄 Stopping old containers..."
docker stop $(docker ps -q --filter ancestor=$IMAGE_NAME) 2>/dev/null || echo "No containers to stop"
docker rm $(docker ps -aq --filter ancestor=$IMAGE_NAME) 2>/dev/null || echo "No containers to remove"

echo "🚀 Starting new container..."
docker run -d \
    --name $CONTAINER_NAME-$(date +%s) \
    --network $(docker network ls --filter name=ppid --format "{{.Name}}" | head -1) \
    -p 3000:3000 \
    -v $(docker volume ls --filter name=uploads --format "{{.Name}}" | head -1):/app/public/uploads \
    -e DATABASE_URL="postgresql://postgres:postgres@$(docker ps --filter name=postgres --format "{{.Names}}" | head -1):5432/ppid_garut?schema=public" \
    -e JWT_SECRET="${JWT_SECRET:-your-secure-jwt-secret}" \
    -e NEXT_PUBLIC_API_URL="/api" \
    --restart unless-stopped \
    $IMAGE_NAME:latest

echo "⏳ Waiting for startup..."
sleep 15

echo "🔍 Checking status..."
docker ps --filter ancestor=$IMAGE_NAME

echo "✅ Update completed!"
echo "🌐 Application: http://localhost:3000"