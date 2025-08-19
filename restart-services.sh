#!/bin/bash
set -e

echo "🔄 Restarting services..."

cd /opt/ppid

# Check status
echo "Current status:"
sudo docker-compose ps

# Restart all services
sudo docker-compose down
sudo docker-compose up -d

# Wait for services
echo "Waiting for services..."
sleep 30

# Check logs
echo "App logs:"
sudo docker-compose logs --tail=20 app

echo "✅ Services restarted!"
echo "🌐 Try: http://ppidgarut.kamaltz.fun"