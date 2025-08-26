#!/bin/bash

# Fix Docker Compose Permissions

echo "🔧 Fixing Docker Compose permissions..."

# Fix docker-compose binary permissions
if [ -f "/usr/local/bin/docker-compose" ]; then
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Fixed /usr/local/bin/docker-compose permissions"
fi

# Add user to docker group
sudo usermod -aG docker $USER
echo "✅ Added $USER to docker group"

# Check docker compose availability
if command -v "docker compose" &> /dev/null; then
    echo "✅ Docker Compose (v2) available: $(docker compose version)"
elif command -v docker-compose &> /dev/null; then
    echo "✅ Docker Compose (v1) available: $(docker-compose --version)"
else
    echo "❌ Docker Compose not found"
    echo "Installing Docker Compose..."
    
    # Install Docker Compose v2
    sudo apt-get update
    sudo apt-get install -y docker-compose-plugin
    
    echo "✅ Docker Compose installed"
fi

echo "🔄 Please logout and login again for group changes to take effect"
echo "Or run: newgrp docker"