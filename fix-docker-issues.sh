#!/bin/bash
set -e

echo "🔧 Fixing Docker deployment issues..."

# Fix permissions
sudo chown -R 1001:1001 /opt/ppid/uploads
sudo chmod -R 755 /opt/ppid/uploads

# Restart services with fresh pull
cd /opt/ppid
sudo docker-compose down
sudo docker-compose pull
sudo docker system prune -f
sudo docker-compose up -d

# Wait for services
echo "Waiting for services to start..."
sleep 30

# Check service status
sudo docker-compose ps
sudo docker-compose logs --tail=50

echo "✅ Issues fixed!"