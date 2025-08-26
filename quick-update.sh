#!/bin/bash

# Quick PPID Master Update (No Backup)
# For development/testing - updates container without backup

set -e

echo "⚡ Quick update starting..."

echo "📦 Pulling latest image..."
docker-compose -f docker-compose.deploy.yml pull app

echo "🔄 Recreating container..."
docker-compose -f docker-compose.deploy.yml up -d --force-recreate app

echo "⏳ Waiting for startup..."
sleep 5

echo "✅ Quick update completed!"
docker-compose -f docker-compose.deploy.yml ps