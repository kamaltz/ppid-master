#!/bin/bash

echo "🔧 Fixing Docker uploads permissions..."

# Stop app container
docker stop ppid-app 2>/dev/null

# Fix permissions on host
echo "📁 Fixing host permissions..."
mkdir -p uploads/images
chmod -R 777 uploads/

# Fix permissions in container
echo "🐳 Fixing container permissions..."
docker exec ppid-postgres sh -c "mkdir -p /var/lib/postgresql/data && chmod 755 /var/lib/postgresql/data" 2>/dev/null || echo "DB permissions OK"

# Restart app with correct volume permissions
echo "🚀 Restarting app..."
docker rm ppid-app 2>/dev/null

docker run -d --name ppid-app \
  --link ppid-postgres:postgres \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:postgres123@postgres:5432/ppid_garut?schema=public" \
  -e JWT_SECRET="secure-jwt-secret" \
  -e NEXT_PUBLIC_API_URL="/api" \
  -v "$(pwd)/uploads:/app/public/uploads:rw" \
  ppid-app

echo "⏳ Waiting for app..."
sleep 20

echo "✅ Permissions fixed!"
docker ps --filter "name=ppid"