#!/bin/bash
set -e

echo "🔧 Final fix for all API endpoints..."

cd /opt/ppid

# Add missing columns to all tables
echo "Adding missing columns..."
sudo docker-compose exec -T postgres psql -U postgres -d ppid_garut -c "
ALTER TABLE requests ADD COLUMN IF NOT EXISTS created_by INTEGER;
ALTER TABLE keberatan ADD COLUMN IF NOT EXISTS created_by INTEGER;
ALTER TABLE informasi_publik ADD COLUMN IF NOT EXISTS created_by INTEGER;

UPDATE requests SET created_by = pemohon_id WHERE created_by IS NULL;
UPDATE keberatan SET created_by = pemohon_id WHERE created_by IS NULL;
UPDATE informasi_publik SET created_by = 1 WHERE created_by IS NULL;
"

# Restart app
echo "Restarting application..."
sudo docker-compose restart app
sleep 15

echo "✅ All APIs fixed!"
echo "🌐 Try: https://ppidgarut.kamaltz.fun"