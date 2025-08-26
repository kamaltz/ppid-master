#!/bin/bash

echo "🔧 Fixing favicon and logo issues in Docker deployment..."

# Stop containers
echo "⏹️ Stopping containers..."
docker-compose -f docker-compose.deploy.yml down

# Remove old images to force rebuild
echo "🗑️ Removing old images..."
docker rmi $(docker images "*ppid-master*" -q) 2>/dev/null || echo "No images to remove"

# Clear Docker cache
echo "🧹 Clearing Docker cache..."
docker system prune -f

# Ensure uploads directory exists with proper permissions
echo "📁 Creating uploads directory..."
mkdir -p uploads/images
chmod 755 uploads/images

# Rebuild and start
echo "🔨 Rebuilding and starting containers..."
docker-compose -f docker-compose.deploy.yml up --build -d

# Wait for containers to be ready
echo "⏳ Waiting for containers to be ready..."
sleep 30

# Check if containers are running
echo "✅ Checking container status..."
docker-compose -f docker-compose.deploy.yml ps

# Test favicon endpoint
echo "🧪 Testing favicon endpoint..."
curl -I http://localhost:3000/api/favicon || echo "Favicon endpoint not ready yet"

# Test uploads endpoint
echo "🧪 Testing uploads endpoint..."
curl -I http://localhost:3000/api/uploads/images/ || echo "Uploads endpoint not ready yet"

echo "✅ Favicon and logo fix completed!"
echo "📝 Please test by:"
echo "   1. Go to http://localhost:3000/admin/pengaturan"
echo "   2. Upload a new logo and favicon"
echo "   3. Save settings"
echo "   4. Check if favicon updates in browser tab"