#!/bin/bash
set -e

echo "🔧 Fixing database schema..."

cd /opt/ppid

# Add missing created_by column
echo "Adding created_by column to informasi_publik table..."
sudo docker-compose exec -T postgres psql -U postgres -d ppid_garut -c "
ALTER TABLE informasi_publik ADD COLUMN IF NOT EXISTS created_by INTEGER;
ALTER TABLE informasi_publik ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
"

# Update existing records with default created_by
echo "Setting default created_by for existing records..."
sudo docker-compose exec -T postgres psql -U postgres -d ppid_garut -c "
UPDATE informasi_publik SET created_by = 1 WHERE created_by IS NULL;
"

# Restart app to clear cache
echo "Restarting application..."
sudo docker-compose restart app

echo "✅ Schema fixed!"
echo "🌐 Try: http://ppidgarut.kamaltz.fun"