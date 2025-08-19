#!/bin/bash
set -e

echo "🔄 Creating migration for schema changes..."

cd /opt/ppid

# Stop app
sudo docker-compose stop app

# Create migration manually
echo "Creating migration file..."
sudo mkdir -p prisma/migrations/$(date +%Y%m%d%H%M%S)_add_created_by_columns

sudo tee prisma/migrations/$(date +%Y%m%d%H%M%S)_add_created_by_columns/migration.sql > /dev/null << 'EOF'
-- AlterTable
ALTER TABLE "requests" ADD COLUMN "created_by" INTEGER;

-- AlterTable  
ALTER TABLE "keberatan" ADD COLUMN "created_by" INTEGER;

-- Update existing records
UPDATE "requests" SET "created_by" = 1 WHERE "created_by" IS NULL;
UPDATE "keberatan" SET "created_by" = 1 WHERE "created_by" IS NULL;
UPDATE "informasi_publik" SET "created_by" = 1 WHERE "created_by" IS NULL;
EOF

# Apply migration
echo "Applying migration..."
sudo docker-compose run --rm -T app npx prisma migrate deploy

# Start app
sudo docker-compose up -d app

echo "✅ Migration created and applied!"