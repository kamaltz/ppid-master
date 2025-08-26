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

# Get existing container info
EXISTING_CONTAINER=$(docker ps -q --filter name=ppid-app)
if [ ! -z "$EXISTING_CONTAINER" ]; then
    echo "📋 Getting config from existing container..."
    NETWORK=$(docker inspect $EXISTING_CONTAINER --format '{{range $k, $v := .NetworkSettings.Networks}}{{$k}}{{end}}')
    VOLUME_MOUNT=$(docker inspect $EXISTING_CONTAINER --format '{{range .Mounts}}{{if eq .Destination "/app/public/uploads"}}{{.Source}}{{end}}{{end}}')
    
    echo "🔄 Stopping existing container..."
    docker stop $EXISTING_CONTAINER
    docker rm $EXISTING_CONTAINER
else
    echo "⚠️ No existing container found, using defaults..."
    NETWORK="ppid_default"
    VOLUME_MOUNT="/opt/ppid/uploads"
fi

echo "🚀 Starting new container..."
if [ ! -z "$VOLUME_MOUNT" ] && [ "$VOLUME_MOUNT" != "" ]; then
    VOLUME_ARG="-v $VOLUME_MOUNT:/app/public/uploads"
else
    VOLUME_ARG="-v /opt/ppid/uploads:/app/public/uploads"
fi

docker run -d \
    --name ppid-app-1 \
    --network $NETWORK \
    -p 127.0.0.1:3000:3000 \
    $VOLUME_ARG \
    -e DATABASE_URL="postgresql://postgres:postgres@ppid-postgres-1:5432/ppid_garut?schema=public" \
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