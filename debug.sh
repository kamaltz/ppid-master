#!/bin/bash

echo "🔍 Debugging PPID Master..."

cd /opt/ppid

# Check containers
echo "=== Container Status ==="
sudo docker-compose ps
echo ""
sudo docker-compose -f /opt/caddy-compose.yml ps

# Check app logs
echo "=== App Logs ==="
sudo docker-compose logs --tail=20 app

# Check if app responds internally
echo "=== Internal Connection Test ==="
sudo docker-compose exec caddy curl -s http://ppid-app-1:3000 || echo "App not responding"

# Restart app if needed
echo "=== Restarting App ==="
sudo docker-compose restart app
sleep 15

echo "=== Testing Again ==="
sudo docker-compose exec caddy curl -s http://ppid-app-1:3000 || echo "Still not responding"