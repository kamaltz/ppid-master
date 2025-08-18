#!/bin/bash
set -e

echo "🔧 Fixing PPID Master deployment issues..."

cd ~/ppid-master

# Stop services
docker-compose down

# Remove old volumes to ensure clean start
docker volume rm ppid-master_postgres_data 2>/dev/null || true

# Start fresh
docker-compose up -d

# Wait for database
echo "Waiting for database..."
sleep 30

# Manual seed if auto-seed failed
echo "Running manual database seed..."
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npx prisma db seed

# Restart app to ensure clean state
docker-compose restart app

# Wait for app
sleep 15

echo "✅ Issues fixed!"
echo "🌐 Try accessing: http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_VPS_IP')"
echo "📊 Admin: admin@garut.go.id / Garut@2025?"

# Show logs
docker-compose logs --tail=20 app