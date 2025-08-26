#!/bin/bash

# PPID Master Container Update Script
# Updates running container without resetting database

set -e

echo "🚀 Starting PPID Master container update..."

# Configuration
CONTAINER_NAME="ppid-master-app"
IMAGE_NAME="ppid-master"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

echo "📦 Pulling latest image..."
docker-compose -f docker-compose.deploy.yml pull

echo "💾 Creating database backup..."
docker-compose -f docker-compose.deploy.yml exec -T postgres pg_dump -U postgres ppid_garut > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

echo "📁 Backing up uploads..."
docker cp $(docker-compose -f docker-compose.deploy.yml ps -q app):/app/public/uploads "$BACKUP_DIR/uploads_$TIMESTAMP" 2>/dev/null || echo "No uploads to backup"

echo "🔄 Stopping application container..."
docker-compose -f docker-compose.deploy.yml stop app

echo "🗑️ Removing old application container..."
docker-compose -f docker-compose.deploy.yml rm -f app

echo "🚀 Starting updated container..."
docker-compose -f docker-compose.deploy.yml up -d app

echo "⏳ Waiting for container to be ready..."
sleep 10

echo "🔍 Checking container health..."
docker-compose -f docker-compose.deploy.yml logs --tail=20 app

echo "✅ Update completed successfully!"
echo "📊 Backup files created:"
echo "   - Database: $BACKUP_DIR/db_backup_$TIMESTAMP.sql"
echo "   - Uploads: $BACKUP_DIR/uploads_$TIMESTAMP/"
echo ""
echo "🌐 Application should be available at: http://localhost:3000"