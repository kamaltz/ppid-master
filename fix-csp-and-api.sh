#!/bin/bash

echo "🔧 Fixing CSP and API issues..."

# Restart app to apply new CSP settings
echo "🔄 Restarting app..."
docker stop ppid-app
docker rm ppid-app

# Start with relaxed CSP
docker run -d --name ppid-app \
  --link ppid-postgres:postgres \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:postgres123@postgres:5432/ppid_garut?schema=public" \
  -e JWT_SECRET="ppid-garut-jwt-secret-2024" \
  -e NEXT_PUBLIC_API_URL="/api" \
  -e NODE_ENV=production \
  -v "$(pwd)/uploads:/app/public/uploads" \
  ppid-app

echo "⏳ Waiting for restart..."
sleep 25

# Test API endpoints
echo "🧪 Testing APIs..."
curl -s http://localhost:3000/api/health | head -1 || echo "Health: Starting..."
curl -s http://localhost:3000/api/settings | head -1 || echo "Settings: Starting..."

echo "✅ Restart complete!"
echo "🌐 Access: http://localhost:3000"
echo "📝 Try uploading favicon again"