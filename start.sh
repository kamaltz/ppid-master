#!/bin/sh

# Wait for database to be ready
echo "Waiting for database..."
until npx prisma db push --accept-data-loss; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

# Run migrations and seed
echo "Running database migrations..."
npx prisma migrate deploy

echo "Seeding database..."
node scripts/seed.js

echo "Starting application..."
node server.js