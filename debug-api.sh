#!/bin/bash

echo "🔍 Debugging API issues..."

cd ~/ppid-master

# Check container status
echo "=== Container Status ==="
docker-compose ps

# Check app logs
echo "=== App Logs (last 50 lines) ==="
docker-compose logs --tail=50 app

# Check database connection
echo "=== Database Connection Test ==="
docker-compose exec postgres psql -U postgres -d ppid_garut -c "\dt"

# Check if tables exist
echo "=== Checking Tables ==="
docker-compose exec postgres psql -U postgres -d ppid_garut -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public';"

# Test API endpoint directly
echo "=== Testing API Endpoint ==="
curl -s http://localhost:3000/api/informasi || echo "API not responding"

# Restart app with fresh logs
echo "=== Restarting App ==="
docker-compose restart app
sleep 10

echo "=== Fresh App Logs ==="
docker-compose logs --tail=20 app