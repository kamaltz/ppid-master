#!/bin/bash

echo "🚀 Quick Docker deployment..."

# Clean up
docker stop ppid-app ppid-postgres 2>/dev/null
docker rm ppid-app ppid-postgres 2>/dev/null

# Create uploads
mkdir -p uploads/images

# Build with verbose output
echo "🔨 Building image..."
docker build --no-cache -t ppid-app . || {
  echo "❌ Build failed"
  exit 1
}

# Start database
echo "🗄️ Starting database..."
docker run -d --name ppid-postgres \
  -e POSTGRES_DB=ppid_garut \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres123 \
  postgres:14-alpine

sleep 10

# Start app
echo "🚀 Starting app..."
docker run -d --name ppid-app \
  --link ppid-postgres:postgres \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:postgres123@postgres:5432/ppid_garut?schema=public" \
  -e JWT_SECRET="secure-jwt-secret" \
  -e NEXT_PUBLIC_API_URL="/api" \
  -v "$(pwd)/uploads:/app/public/uploads" \
  ppid-app

sleep 20

echo "✅ Deployment complete!"
docker ps
curl -I http://localhost:3000 || echo "App starting..."