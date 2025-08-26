#!/bin/bash

echo "🚀 Complete PPID deployment script..."

# Cleanup
echo "🧹 Cleaning up..."
docker stop ppid-app ppid-postgres 2>/dev/null
docker rm ppid-app ppid-postgres 2>/dev/null
docker rmi ppid-app 2>/dev/null

# Create uploads directory
echo "📁 Creating uploads..."
mkdir -p uploads/images
chmod 777 uploads/

# Build image
echo "🔨 Building image..."
docker build -t ppid-app . || {
  echo "❌ Build failed!"
  exit 1
}

# Start database
echo "🗄️ Starting PostgreSQL..."
docker run -d --name ppid-postgres \
  -e POSTGRES_DB=ppid_garut \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres123 \
  -v ppid-postgres-data:/var/lib/postgresql/data \
  postgres:14-alpine

echo "⏳ Waiting for database..."
sleep 15

# Start application
echo "🚀 Starting application..."
docker run -d --name ppid-app \
  --link ppid-postgres:postgres \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:postgres123@postgres:5432/ppid_garut?schema=public" \
  -e JWT_SECRET="secure-jwt-secret-change-this" \
  -e NEXT_PUBLIC_API_URL="/api" \
  -e NODE_ENV=production \
  -v "$(pwd)/uploads:/app/public/uploads" \
  ppid-app

echo "⏳ Waiting for application..."
sleep 30

# Check status
echo "✅ Deployment status:"
docker ps --filter "name=ppid"

# Test application
echo "🧪 Testing application..."
curl -I http://localhost:3000/api/health 2>/dev/null || echo "Health check: Starting..."

echo ""
echo "🌐 Application URL: http://localhost:3000"
echo "👤 Default admin: admin@admin.com / admin123"
echo "📝 Upload test: Try uploading favicon in /admin/pengaturan"