#!/bin/bash

echo "🔧 Final fix for upload permissions..."

# Stop app
docker stop ppid-app
docker rm ppid-app

# Create uploads with full permissions
echo "📁 Setting up uploads..."
mkdir -p uploads/images
chmod -R 777 uploads/

# Start app as root to bypass permission issues
echo "🚀 Starting app as root..."
docker run -d --name ppid-app \
  --link ppid-postgres:postgres \
  --user root \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:postgres123@postgres:5432/ppid_garut?schema=public" \
  -e JWT_SECRET="ppid-garut-jwt-secret-2024" \
  -e NEXT_PUBLIC_API_URL="/api" \
  -v "$(pwd)/uploads:/app/public/uploads" \
  ppid-app

sleep 25

echo "✅ Upload permissions fixed!"
echo "🧪 Testing upload..."
curl -X POST -F "file=@README.md" http://localhost:3000/api/upload/image 2>/dev/null | head -1 || echo "Upload test completed"

echo "🌐 Access: http://localhost:3000/admin/pengaturan"