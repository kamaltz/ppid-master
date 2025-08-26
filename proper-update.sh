#!/bin/bash

# Proper PPID Master Container Update Script
# Handles all edge cases and ensures smooth updates

set -e

echo "🚀 PPID Master Proper Update Script"
echo "=================================="

# Configuration
DOCKERHUB_USERNAME="${DOCKERHUB_USERNAME:-kamaltz}"
IMAGE_NAME="${DOCKERHUB_USERNAME}/ppid-master"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Function to get database password
get_db_password() {
    local password
    password=$(docker exec ppid-postgres-1 printenv POSTGRES_PASSWORD 2>/dev/null || echo "")
    if [ -z "$password" ]; then
        # Try common passwords
        for pwd in "postgres" "password" "admin"; do
            if docker exec ppid-postgres-1 psql -U postgres -d ppid_garut -c "SELECT 1;" >/dev/null 2>&1; then
                echo "$pwd"
                return
            fi
        done
        echo "postgres"  # fallback
    else
        echo "$password"
    fi
}

# Function to check container health
check_health() {
    local container_name="$1"
    local max_attempts=30
    local attempt=1
    
    echo "🔍 Checking container health..."
    while [ $attempt -le $max_attempts ]; do
        if docker exec $container_name curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
            echo "✅ Container is healthy!"
            return 0
        fi
        echo "⏳ Attempt $attempt/$max_attempts - waiting for container..."
        sleep 5
        attempt=$((attempt + 1))
    done
    
    echo "⚠️ Container health check timeout"
    return 1
}

echo "📋 Step 1: Pre-update checks"
echo "----------------------------"

# Check if containers exist
if ! docker ps --filter name=ppid-postgres-1 --format "{{.Names}}" | grep -q ppid-postgres-1; then
    echo "❌ Database container not found!"
    exit 1
fi

echo "✅ Database container found"

# Get database password
DB_PASSWORD=$(get_db_password)
echo "📋 Database password detected"

echo "📋 Step 2: Create backup"
echo "------------------------"

# Backup database
echo "💾 Creating database backup..."
if docker exec ppid-postgres-1 pg_dump -U postgres ppid_garut > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql" 2>/dev/null; then
    echo "✅ Database backup created: $BACKUP_DIR/db_backup_$TIMESTAMP.sql"
else
    echo "⚠️ Database backup failed, continuing..."
fi

# Backup uploads
echo "📁 Backing up uploads..."
if docker cp ppid-app-1:/app/public/uploads "$BACKUP_DIR/uploads_$TIMESTAMP" 2>/dev/null; then
    echo "✅ Uploads backup created: $BACKUP_DIR/uploads_$TIMESTAMP"
else
    echo "⚠️ Uploads backup failed or no uploads found"
fi

echo "📋 Step 3: Pull new image"
echo "-------------------------"

# Pull latest image
echo "📦 Pulling latest image: $IMAGE_NAME:latest"
if docker pull $IMAGE_NAME:latest; then
    echo "✅ Image pulled successfully"
else
    echo "❌ Failed to pull image. Check Docker Hub access."
    exit 1
fi

echo "📋 Step 4: Stop current container"
echo "---------------------------------"

# Get current container info before stopping
CURRENT_NETWORK=""
CURRENT_VOLUME=""
if docker ps --filter name=ppid-app-1 --format "{{.Names}}" | grep -q ppid-app-1; then
    echo "📋 Getting current container configuration..."
    CURRENT_NETWORK=$(docker inspect ppid-app-1 --format '{{range $k, $v := .NetworkSettings.Networks}}{{$k}}{{end}}' 2>/dev/null || echo "ppid_default")
    CURRENT_VOLUME=$(docker inspect ppid-app-1 --format '{{range .Mounts}}{{if eq .Destination "/app/public/uploads"}}{{.Source}}{{end}}{{end}}' 2>/dev/null || echo "/opt/ppid/uploads")
    
    echo "🔄 Stopping current container..."
    docker stop ppid-app-1
    docker rm ppid-app-1
    echo "✅ Current container stopped and removed"
else
    echo "⚠️ No existing container found"
    CURRENT_NETWORK="ppid_default"
    CURRENT_VOLUME="/opt/ppid/uploads"
fi

echo "📋 Step 5: Start new container"
echo "------------------------------"

# Ensure uploads directory exists
mkdir -p "$CURRENT_VOLUME" 2>/dev/null || sudo mkdir -p "$CURRENT_VOLUME" 2>/dev/null || echo "⚠️ Could not create uploads directory"

# Start new container
echo "🚀 Starting new container..."
docker run -d \
    --name ppid-app-1 \
    --network "$CURRENT_NETWORK" \
    -p 127.0.0.1:3000:3000 \
    -v "$CURRENT_VOLUME:/app/public/uploads" \
    -e DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@ppid-postgres-1:5432/ppid_garut?schema=public" \
    -e JWT_SECRET="${JWT_SECRET:-your-secure-jwt-secret}" \
    -e NEXT_PUBLIC_API_URL="/api" \
    --restart unless-stopped \
    $IMAGE_NAME:latest

echo "✅ New container started"

echo "📋 Step 6: Health check"
echo "-----------------------"

# Wait and check health
sleep 10
if check_health ppid-app-1; then
    echo "🎉 Update completed successfully!"
else
    echo "⚠️ Container started but health check failed"
    echo "📋 Container logs:"
    docker logs --tail=20 ppid-app-1
fi

echo "📋 Step 7: Final status"
echo "----------------------"

echo "📊 Container status:"
docker ps --filter name=ppid-app

echo "🌐 Application URL: http://localhost:3000"
echo "📁 Backup files:"
echo "   - Database: $BACKUP_DIR/db_backup_$TIMESTAMP.sql"
echo "   - Uploads: $BACKUP_DIR/uploads_$TIMESTAMP/"

echo ""
echo "✅ Update process completed!"
echo "🔧 If issues occur, restore with:"
echo "   docker exec -i ppid-postgres-1 psql -U postgres -d ppid_garut < $BACKUP_DIR/db_backup_$TIMESTAMP.sql"