#!/bin/bash

echo "🔧 Fixing port conflict..."

# Kill any process using port 3000
echo "🔪 Killing processes on port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "No processes on port 3000"

# Stop and remove all ppid containers
echo "🛑 Stopping containers..."
docker stop $(docker ps -q --filter "name=ppid") 2>/dev/null || echo "No containers to stop"
docker rm $(docker ps -aq --filter "name=ppid") 2>/dev/null || echo "No containers to remove"

# Wait a moment
sleep 5

# Start database
echo "🗄️ Starting database..."
docker run -d --name ppid-postgres \
  -e POSTGRES_DB=ppid_garut \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres123 \
  postgres:14-alpine

sleep 10

# Start app on port 3000
echo "🚀 Starting app on port 3000..."
docker run -d --name ppid-app \
  --link ppid-postgres:postgres \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:postgres123@postgres:5432/ppid_garut?schema=public" \
  -e JWT_SECRET="secure-jwt-secret" \
  -e NEXT_PUBLIC_API_URL="/api" \
  -v "$(pwd)/uploads:/app/public/uploads" \
  ppid-app

sleep 20

echo "✅ Status:"
docker ps --filter "name=ppid"

echo "🧪 Testing:"
curl -I http://localhost:3000 2>/dev/null || echo "App starting..."

echo "🌐 Access: http://localhost:3000"