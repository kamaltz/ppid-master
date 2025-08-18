#!/bin/sh
set -e

echo "Waiting for database..."
until pg_isready -h postgres -p 5432 -U postgres; do
  sleep 2
done
echo "Database ready"

echo "Generating Prisma client..."
npx prisma generate

echo "Running migrations..."
npx prisma migrate deploy

echo "Seeding database..."
npx prisma db seed

echo "Starting application..."
exec node server.js