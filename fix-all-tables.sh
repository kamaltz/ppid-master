#!/bin/bash
set -e

echo "🔧 Fixing all database tables..."

cd /opt/ppid

# Fix all missing columns
echo "Adding missing columns to all tables..."
sudo docker-compose exec -T postgres psql -U postgres -d ppid_garut -c "
-- Fix requests table
ALTER TABLE requests ADD COLUMN IF NOT EXISTS created_by INTEGER;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Fix keberatan table  
ALTER TABLE keberatan ADD COLUMN IF NOT EXISTS created_by INTEGER;
ALTER TABLE keberatan ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Fix informasi_publik table (already done but ensure)
ALTER TABLE informasi_publik ADD COLUMN IF NOT EXISTS created_by INTEGER;
ALTER TABLE informasi_publik ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update existing records with default created_by
UPDATE requests SET created_by = 1 WHERE created_by IS NULL;
UPDATE keberatan SET created_by = 1 WHERE created_by IS NULL;
UPDATE informasi_publik SET created_by = 1 WHERE created_by IS NULL;
"

# Restart app
echo "Restarting application..."
sudo docker-compose restart app
sleep 10

echo "✅ All tables fixed!"
echo "🌐 Try: http://ppidgarut.kamaltz.fun"