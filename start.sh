#!/bin/sh
# Keluar segera jika ada perintah yang gagal
set -e

echo "Waiting for database to be ready..."
# Loop ini menunggu sampai container database benar-benar siap
until pg_isready -h postgres -p 5432 -U postgres; do
  sleep 2
done
echo "Database is ready."

echo "Generating Prisma Client..."
# TAMBAHKAN BARIS INI: Pastikan client di-generate di lingkungan runtime
npx prisma generate

echo "Running database migrations..."
# Perintah yang benar untuk migrasi di production
npx prisma migrate deploy

echo "Seeding database..."
# Jalankan seeding setelah migrasi berhasil
node /app/scripts/seed.js

echo "Starting application..."
# 'exec' akan menggantikan proses shell dengan proses node,
# ini adalah praktik terbaik untuk CMD di Docker.
exec node server.js