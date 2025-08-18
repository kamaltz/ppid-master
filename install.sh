#!/bin/bash
set -e

echo "🚀 PPID Master - Easy VPS Installation"

# Install Docker
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Create app directory
mkdir -p ~/ppid-master
cd ~/ppid-master

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ppid_garut
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    image: kamaltz/ppid-master:latest
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: "postgresql://postgres:postgres123@postgres:5432/ppid_garut?schema=public"
      JWT_SECRET: "ppid-garut-secret-2025"
      NEXT_PUBLIC_API_URL: "http://localhost:3000/api"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./uploads:/app/public/uploads
    restart: unless-stopped

volumes:
  postgres_data:
EOF

# Create uploads directory
mkdir -p uploads
chmod 755 uploads

# Start services
echo "Starting PPID Master..."
docker-compose pull
docker-compose up -d

# Wait for services
echo "Waiting for services to start..."
sleep 30

# Install Nginx
if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    sudo apt update
    sudo apt install -y nginx
fi

# Configure Nginx
sudo tee /etc/nginx/sites-available/ppid-master << 'EOF'
server {
    listen 80;
    server_name _;
    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable site
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/ppid-master /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Configure firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
echo "y" | sudo ufw enable 2>/dev/null || true

echo ""
echo "✅ Installation Complete!"
echo "🌐 Access: http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_VPS_IP')"
echo ""
echo "📊 Default Accounts:"
echo "   Admin: admin@garut.go.id / Garut@2025?"
echo "   PPID Utama: ppid.utama@garut.go.id / Garut@2025?"
echo "   Pemohon: pemohon@example.com / Garut@2025?"
echo ""
echo "📋 Management Commands:"
echo "   View logs: docker-compose logs -f"
echo "   Restart: docker-compose restart"
echo "   Update: docker-compose pull && docker-compose up -d"
echo "   Stop: docker-compose down"