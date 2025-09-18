#!/bin/sh
set -e

echo "🔄 Starting PPID Master application..."

echo "⏳ Waiting for database..."
until pg_isready -h postgres -p 5432 -U postgres; do
  echo "Database not ready, waiting..."
  sleep 2
done
echo "✅ Database ready"

# Wait a bit more to ensure database is fully ready
sleep 5

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "📊 Running database migrations..."
# Check for failed migrations and resolve them
if ! npx prisma migrate deploy 2>/dev/null; then
  echo "⚠️ Migration failed, attempting to resolve..."
  # Mark common failed migrations as resolved
  npx prisma migrate resolve --applied 20241220000001_fix_settings_structure 2>/dev/null || echo "Migration 20241220000001 resolve failed or not needed"
  npx prisma migrate resolve --applied 20250826_add_pemohon_approval 2>/dev/null || echo "Migration 20250826 resolve failed or not needed"
  npx prisma migrate resolve --applied 20250827_add_pemohon_fields 2>/dev/null || echo "Migration 20250827 resolve failed or not needed"
  # Try deploy again
  npx prisma migrate deploy || echo "Migration deploy failed, continuing with manual column addition..."
fi

# Check migration status
echo "🔍 Checking migration status..."
npx prisma migrate status || echo "Migration status check completed"

echo "🔧 Adding missing database columns..."
PGPASSWORD=${POSTGRES_PASSWORD:-postgres} psql -h postgres -U postgres -d ppid_garut -c "ALTER TABLE pemohon ADD COLUMN IF NOT EXISTS pekerjaan TEXT;" || echo "pekerjaan column already exists or failed to add"
PGPASSWORD=${POSTGRES_PASSWORD:-postgres} psql -h postgres -U postgres -d ppid_garut -c "ALTER TABLE pemohon ADD COLUMN IF NOT EXISTS ktp_image TEXT;" || echo "ktp_image column already exists or failed to add"
PGPASSWORD=${POSTGRES_PASSWORD:-postgres} psql -h postgres -U postgres -d ppid_garut -c "ALTER TABLE pemohon ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;" || echo "is_approved column already exists or failed to add"
PGPASSWORD=${POSTGRES_PASSWORD:-postgres} psql -h postgres -U postgres -d ppid_garut -c "ALTER TABLE pemohon ADD COLUMN IF NOT EXISTS approved_by TEXT;" || echo "approved_by column already exists or failed to add"
PGPASSWORD=${POSTGRES_PASSWORD:-postgres} psql -h postgres -U postgres -d ppid_garut -c "ALTER TABLE pemohon ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP(3);" || echo "approved_at column already exists or failed to add"

# Check for custom database import
if [ -f "/app/ppid_db.sql" ]; then
  echo "📥 Found ppid_db.sql - importing custom database..."
  PGPASSWORD=${POSTGRES_PASSWORD:-postgres} psql -h postgres -U postgres -d ppid_garut < /app/ppid_db.sql
  echo "✅ Custom database imported successfully"
else
  echo "🌱 No ppid_db.sql found - using default seed data..."
  npx prisma db seed || echo "⚠️ Seeding failed or already completed"
fi

echo "📁 Creating uploads directory..."
mkdir -p /app/public/uploads/images
chmod -R 777 /app/public/uploads 2>/dev/null || echo "⚠️ Could not change uploads permissions"
chown -R nextjs:nodejs /app/public/uploads 2>/dev/null || echo "⚠️ Could not change uploads ownership (running as non-root)"

echo "🚀 Starting application..."
exec node server.js