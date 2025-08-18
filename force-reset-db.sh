#!/bin/bash
set -e

cd /opt/ppid

# Stop services
sudo docker-compose down

# Remove database volume completely
sudo docker volume rm ppid_postgres_data 2>/dev/null || true

# Start fresh
sudo docker-compose up -d
sleep 45

# Force database setup
echo "Setting up fresh database..."
sudo docker-compose exec -T app sh -c "
npx prisma generate
npx prisma db push --force-reset --accept-data-loss
npx prisma db seed
"

# Restart app
sudo docker-compose restart app
sleep 15

echo "✅ Database reset complete"
curl -s http://127.0.0.1:3000 || echo "Still starting..."