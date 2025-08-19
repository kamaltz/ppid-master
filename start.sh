#!/bin/sh
set -e

echo "Waiting for database..."
until pg_isready -h postgres -p 5432 -U postgres; do
  echo "Database not ready, waiting..."
  sleep 2
done
echo "Database ready"

# Wait a bit more to ensure database is fully ready
sleep 5

echo "Generating Prisma client..."
npx prisma generate

echo "Running migrations..."
npx prisma migrate deploy

# Check for custom database import
if [ -f "/app/ppid_db.sql" ]; then
  echo "Found ppid_db.sql - importing custom database..."
  PGPASSWORD=$POSTGRES_PASSWORD psql -h postgres -U postgres -d ppid_garut < /app/ppid_db.sql
  echo "Custom database imported successfully"
else
  echo "No ppid_db.sql found - using default seed data..."
  npx prisma db seed || echo "Seeding failed or already completed"
fi

echo "Creating uploads directory..."
mkdir -p /app/public/uploads/images
chown -R nextjs:nodejs /app/public/uploads || true

echo "Starting application..."
exec node server.js