#!/bin/bash

echo "🔧 Quick fix for PostgreSQL connection..."

# Stop all containers
docker-compose -f docker-compose.deploy.yml down

# Remove postgres volume completely
docker volume rm ppid-master_postgres_data 2>/dev/null || true

# Start fresh
docker-compose -f docker-compose.deploy.yml up -d

echo "✅ Fix applied. Check logs:"
echo "docker-compose -f docker-compose.deploy.yml logs -f"