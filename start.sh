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
npx prisma migrate deploy

# Check migration status
echo "🔍 Checking migration status..."
npx prisma migrate status || echo "Migration status check completed"

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
chown -R nextjs:nodejs /app/public/uploads 2>/dev/null || echo "⚠️ Could not change uploads ownership (running as non-root)"

echo "🚀 Starting application..."
exec node server.js