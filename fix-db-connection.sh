#!/bin/bash

# Fix Database Connection Script

set -e

echo "🔧 Fixing database connection..."

# Get actual database password from existing container
DB_PASSWORD=$(docker exec ppid-postgres-1 printenv POSTGRES_PASSWORD 2>/dev/null || echo "postgres")

echo "📋 Found database password: $DB_PASSWORD"

# Stop current app container
echo "🔄 Stopping current container..."
docker stop ppid-app-1 2>/dev/null || echo "Container not running"
docker rm ppid-app-1 2>/dev/null || echo "Container not found"

# Start with correct database URL
echo "🚀 Starting container with correct database connection..."
docker run -d \
    --name ppid-app-1 \
    --network ppid_default \
    -p 127.0.0.1:3000:3000 \
    -v /opt/ppid/uploads:/app/public/uploads \
    -e DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@ppid-postgres-1:5432/ppid_garut?schema=public" \
    -e JWT_SECRET="${JWT_SECRET:-your-secure-jwt-secret}" \
    -e NEXT_PUBLIC_API_URL="/api" \
    --restart unless-stopped \
    kamaltz/ppid-master:latest

echo "⏳ Waiting for startup..."
sleep 20

echo "🔍 Checking logs..."
docker logs --tail=10 ppid-app-1

echo "✅ Database connection fixed!"