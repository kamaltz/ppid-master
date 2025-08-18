#!/bin/bash
set -e

echo "🔧 Fixing database schema and permissions..."

cd ~/ppid-master

# Stop services
docker-compose down

# Fix uploads permissions
sudo chown -R 1001:1001 uploads
sudo chmod -R 755 uploads

# Remove old database volume
docker volume rm ppid-master_postgres_data 2>/dev/null || true

# Start fresh
docker-compose up -d postgres
sleep 20

# Start app
docker-compose up -d app
sleep 30

# Force reset database schema
echo "Resetting database schema..."
docker-compose exec -T app sh -c "
npx prisma generate
npx prisma db push --force-reset --accept-data-loss
npx prisma db seed
"

# Restart app
docker-compose restart app
sleep 15

# Fix uploads permissions again
docker-compose exec -T app sh -c "
mkdir -p /app/public/uploads/images
chown -R nextjs:nodejs /app/public/uploads
chmod -R 755 /app/public/uploads
"

echo "✅ Schema and permissions fixed!"
echo "🌐 Test: http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_IP')"