#!/bin/bash

# PPID Master Rollback Script
# Rollback to previous version if update fails

set -e

echo "🔄 PPID Master Rollback Script"
echo "=============================="

BACKUP_DIR="./backups"

# List available backups
echo "📁 Available backups:"
ls -la $BACKUP_DIR/ 2>/dev/null || echo "No backups found"

# Get latest backup
LATEST_DB_BACKUP=$(ls -t $BACKUP_DIR/db_backup_*.sql 2>/dev/null | head -1)
LATEST_UPLOADS_BACKUP=$(ls -td $BACKUP_DIR/uploads_* 2>/dev/null | head -1)

if [ -z "$LATEST_DB_BACKUP" ]; then
    echo "❌ No database backup found!"
    exit 1
fi

echo "📋 Using backup: $LATEST_DB_BACKUP"

# Confirm rollback
read -p "⚠️ Are you sure you want to rollback? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Rollback cancelled"
    exit 1
fi

echo "🔄 Starting rollback process..."

# Stop current container
echo "🛑 Stopping current container..."
docker stop ppid-app-1 2>/dev/null || echo "Container not running"

# Restore database
echo "🗄️ Restoring database..."
docker exec -i ppid-postgres-1 psql -U postgres -d ppid_garut < "$LATEST_DB_BACKUP"

# Restore uploads if available
if [ -n "$LATEST_UPLOADS_BACKUP" ] && [ -d "$LATEST_UPLOADS_BACKUP" ]; then
    echo "📁 Restoring uploads..."
    docker cp "$LATEST_UPLOADS_BACKUP/." ppid-app-1:/app/public/uploads/ 2>/dev/null || echo "⚠️ Could not restore uploads"
fi

# Start container
echo "🚀 Starting container..."
docker start ppid-app-1

echo "⏳ Waiting for startup..."
sleep 15

echo "✅ Rollback completed!"
echo "🌐 Application: http://localhost:3000"