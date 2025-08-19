#!/bin/bash
set -e

echo "🔧 Fixing database..."

cd /opt/ppid

# Stop app
sudo docker-compose stop app

# Reset database volume
sudo docker-compose down
sudo docker volume rm ppid_postgres_data 2>/dev/null || true

# Start fresh
sudo docker-compose up -d
sleep 30

# Setup database
echo "Setting up database..."
sudo docker-compose exec -T app npx prisma generate
sudo docker-compose exec -T app npx prisma db push --force-reset --accept-data-loss
sudo docker-compose exec -T app npx prisma db seed

# Restart app
sudo docker-compose restart app

echo "✅ Database fixed!"
echo "🌐 Try: http://ppidgarut.kamaltz.fun"