#!/bin/bash
set -e

echo "🚀 Starting PPID Master deployment..."

# Wait for database to be ready
echo "⏳ Waiting for database..."
until pg_isready -h postgres -p 5432 -U postgres; do
  echo "Database is unavailable - sleeping"
  sleep 2
done
echo "✅ Database is ready!"

# Run migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Fix settings structure
echo "⚙️ Fixing settings structure..."
npm run fix-settings

# Seed database if needed
echo "🌱 Seeding database..."
npx prisma db seed || echo "Seeding skipped (data already exists)"

echo "✅ Deployment setup complete!"

# Start the application
exec "$@"