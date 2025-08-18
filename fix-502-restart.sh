#!/bin/bash
set -e

cd /opt/ppid

# Stop and restart services
sudo docker-compose down
sudo docker-compose up -d

# Wait for services
sleep 30

# Check if app is running
sudo docker-compose ps

# Check app logs
echo "App logs:"
sudo docker-compose logs --tail=20 app

# Test connection
curl -s http://127.0.0.1:3000 || echo "App still not responding"

echo "✅ Services restarted"