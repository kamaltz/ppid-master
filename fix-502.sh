#!/bin/bash
set -e

cd /opt/ppid

# Check if app is running
echo "Checking services..."
sudo docker-compose ps

# Restart app service
echo "Restarting app..."
sudo docker-compose restart app
sleep 15

# Check app logs
echo "App logs:"
sudo docker-compose logs --tail=10 app

# Test connection
echo "Testing connection..."
curl -s http://127.0.0.1:3000 || echo "App not responding"

# Restart nginx
echo "Restarting Nginx..."
sudo systemctl restart nginx

echo "✅ Services restarted"