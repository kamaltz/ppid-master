#!/bin/bash

echo "🔧 Fixing Docker deployment using direct commands..."

# Stop and remove containers
echo "⏹️ Stopping containers..."
docker stop ppid-app ppid-postgres 2>/dev/null || echo "Containers not running"
docker rm ppid-app ppid-postgres 2>/dev/null || echo "Containers not found"

# Remove old images
echo "🗑️ Removing old images..."
docker rmi ppid-master-app:latest 2>/dev/null || echo "No app image to remove"

# Create network if not exists
echo "🌐 Creating network..."
docker network create ppid-network 2>/dev/null || echo "Network already exists"

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p uploads/images
chmod 755 uploads/images

# Build new image
echo "🔨 Building new image..."
docker build -t ppid-master-app:latest .

# Start PostgreSQL
echo "🗄️ Starting PostgreSQL..."
docker run -d \
  --name ppid-postgres \
  --network ppid-network \
  -e POSTGRES_DB=ppid_garut \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres123 \
  -v ppid-postgres-data:/var/lib/postgresql/data \
  postgres:14-alpine

# Wait for PostgreSQL
echo "⏳ Waiting for PostgreSQL..."
sleep 10

# Start application
echo "🚀 Starting application..."
docker run -d \
  --name ppid-app \
  --network ppid-network \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:postgres123@ppid-postgres:5432/ppid_garut?schema=public" \
  -e JWT_SECRET="your-secure-jwt-secret-key-change-this" \
  -e NEXT_PUBLIC_API_URL="http://localhost:3000/api" \
  -e NODE_ENV=production \
  -v "$(pwd)/uploads:/app/public/uploads" \
  ppid-master-app:latest

# Wait for application
echo "⏳ Waiting for application..."
sleep 30

# Check status
echo "✅ Checking status..."
docker ps --filter "name=ppid"

# Test endpoints
echo "🧪 Testing application..."
curl -I http://localhost:3000/api/health 2>/dev/null || echo "Health endpoint not ready"

echo "✅ Docker deployment completed!"
echo "📝 Access application at: http://localhost:3000"