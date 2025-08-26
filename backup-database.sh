#!/bin/bash

echo "📦 Creating database backup..."

# Create backup directory
mkdir -p backups

# Generate backup filename with timestamp
BACKUP_FILE="backups/ppid_backup_$(date +%Y%m%d_%H%M%S).sql"

# Create database backup
docker exec ppid-postgres pg_dump -U postgres -d ppid_garut > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup created: $BACKUP_FILE"
    echo "📊 Backup size: $(du -h "$BACKUP_FILE" | cut -f1)"
    
    # Keep only last 5 backups
    ls -t backups/ppid_backup_*.sql | tail -n +6 | xargs rm -f 2>/dev/null
    echo "🧹 Old backups cleaned (keeping last 5)"
else
    echo "❌ Backup failed!"
    exit 1
fi