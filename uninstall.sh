#!/bin/bash
set -e

echo "🗑️ Uninstalling PPID Master..."

# Stop and remove containers
if [ -d "/opt/ppid" ]; then
    cd /opt/ppid
    sudo docker-compose down -v 2>/dev/null || true
fi

# Remove Docker images
sudo docker rmi kamaltz/ppid-master:latest 2>/dev/null || true
sudo docker rmi postgres:15-alpine 2>/dev/null || true

# Remove volumes
sudo docker volume rm ppid_postgres_data 2>/dev/null || true

# Clean up Docker system
sudo docker system prune -af

# Remove Nginx config
sudo rm -f /etc/nginx/sites-enabled/ppid-master
sudo rm -f /etc/nginx/sites-available/ppid-master
sudo systemctl reload nginx 2>/dev/null || true

# Remove application directory
sudo rm -rf /opt/ppid

# Remove firewall rules
sudo ufw delete allow 80 2>/dev/null || true
sudo ufw delete allow 443 2>/dev/null || true

echo "✅ PPID Master completely removed!"
echo "📝 Note: Docker and Nginx are still installed"