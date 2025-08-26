#!/bin/bash

# Safe PPID Master Update Script
# Handles docker-compose crashes and segfaults

set -e

echo "🚀 Safe PPID Master Update"

# Detect docker compose
if command -v "docker compose" &> /dev/null; then
    DC="docker compose"
elif command -v docker-compose &> /dev/null; then
    DC="docker-compose"
else
    echo "❌ Docker Compose not found"
    exit 1
fi

echo "📋 Using: $DC"

# Function to run docker compose with retry
run_dc() {
    local cmd="$1"
    local retries=3
    
    while [ $retries -gt 0 ]; do
        echo "🔄 Executing: $DC $cmd"
        if timeout 60 $DC $cmd; then
            return 0
        else
            echo "⚠️ Command failed, retries left: $((retries-1))"
            retries=$((retries-1))
            sleep 2
        fi
    done
    
    echo "❌ Command failed after retries: $DC $cmd"
    return 1
}

# Backup
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

echo "💾 Creating backup..."
if ! run_dc "-f docker-compose.deploy.yml exec -T postgres pg_dump -U postgres ppid_garut" > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"; then
    echo "⚠️ Backup failed, continuing anyway..."
fi

# Update using direct docker commands
echo "📦 Pulling latest image..."
docker pull ppid-master:latest || echo "⚠️ Pull failed"

echo "🔄 Stopping container..."
docker stop ppid-master-app-1 2>/dev/null || docker stop $(docker ps -q --filter ancestor=ppid-master) 2>/dev/null || echo "No container to stop"

echo "🗑️ Removing container..."
docker rm ppid-master-app-1 2>/dev/null || docker rm $(docker ps -aq --filter ancestor=ppid-master) 2>/dev/null || echo "No container to remove"

echo "🚀 Starting new container..."
if ! run_dc "-f docker-compose.deploy.yml up -d app"; then
    echo "❌ Failed to start with compose, trying direct docker run..."
    docker run -d --name ppid-master-app-1 \
        --network ppid-master_default \
        -p 3000:3000 \
        -v ppid-master_uploads:/app/public/uploads \
        -e DATABASE_URL="postgresql://postgres:postgres@postgres:5432/ppid_garut?schema=public" \
        -e JWT_SECRET="your-jwt-secret" \
        ppid-master:latest
fi

echo "⏳ Waiting for startup..."
sleep 10

echo "✅ Update completed!"
docker ps | grep ppid-master || echo "⚠️ Container may not be running"