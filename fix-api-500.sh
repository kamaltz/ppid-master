#!/bin/bash
set -e

echo "🔧 Fixing API 500 errors..."

cd ~/ppid-master

# Stop everything
docker-compose down

# Clean up
docker system prune -f
docker volume prune -f

# Recreate with fresh database
docker-compose up -d postgres
echo "Waiting for database..."
sleep 20

# Start app
docker-compose up -d app
echo "Waiting for app..."
sleep 30

# Force database setup
echo "Setting up database..."
docker-compose exec app sh -c "
npx prisma generate
npx prisma db push --force-reset
npx prisma db seed
"

# Restart app
docker-compose restart app
sleep 15

# Test API
echo "Testing API..."
curl -s http://localhost:3000/api/auth/me || echo "API test failed"

echo "✅ Fix complete. Check logs:"
docker-compose logs --tail=20 app