#!/bin/sh
# Keluar segera jika ada perintah yang gagal
set -e

echo "Waiting for database to be ready..."
# Loop ini akan menunggu sampai container database benar-benar siap
until pg_isready -h postgres -p 5432 -U postgres; do
  sleep 2
done
echo "Database is ready."

echo "Running database migrations..."
# Perintah yang benar untuk migrasi di production
npx prisma migrate deploy

echo "Seeding database..."
# Jalankan seeding setelah migrasi berhasil
node /app/scripts/seed.js

echo "Starting application..."
# Ganti 'npm start' dengan 'exec node server.js' untuk production
# Pastikan file server.js ada di output build Next.js Anda (.next/standalone/server.js)
exec node server.js