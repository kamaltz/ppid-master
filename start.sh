#!/bin/sh

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Waiting for database to be ready..."
# This loop waits for the database container to be responsive
until pg_isready -h postgres -p 5432 -U postgres; do
  sleep 2
done
echo "Database is ready."

echo "Running database migrations..."
npx prisma migrate deploy

echo "Seeding database..."
node /app/scripts/seed.js

echo "Starting application..."
# This is the command that starts the Next.js app
exec node server.js