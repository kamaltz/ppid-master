#!/bin/bash

if [ -z "$1" ]; then
    echo "❌ Usage: $0 <backup_file>"
    echo "📁 Available backups:"
    ls -la backups/ppid_backup_*.sql 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "🔄 Restoring database from: $BACKUP_FILE"

# Stop application to prevent conflicts
echo "⏹️ Stopping application..."
docker stop ppid-app 2>/dev/null

# Drop and recreate database
echo "🗑️ Recreating database..."
docker exec ppid-postgres psql -U postgres -c "DROP DATABASE IF EXISTS ppid_garut;"
docker exec ppid-postgres psql -U postgres -c "CREATE DATABASE ppid_garut;"

# Restore backup
echo "📥 Restoring data..."
docker exec -i ppid-postgres psql -U postgres -d ppid_garut < "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Database restored successfully!"
    
    # Restart application
    echo "🚀 Restarting application..."
    docker start ppid-app 2>/dev/null
    
    echo "🌐 Application available at: http://localhost:3000"
else
    echo "❌ Restore failed!"
    exit 1
fi