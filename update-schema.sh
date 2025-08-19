#!/bin/bash
set -e

echo "🔄 Updating Prisma schema and creating migration..."

cd /opt/ppid

# Stop app temporarily
sudo docker-compose stop app

# Generate new migration
echo "Creating migration..."
sudo docker-compose run --rm app npx prisma migrate dev --name add-created-by-columns

# Start app
sudo docker-compose up -d app
sleep 15

echo "✅ Schema updated with proper migrations!"
echo "🌐 Try: http://ppidgarut.kamaltz.fun"