#!/bin/bash
set -e

echo "🚀 PPID Master VPS Deployment"

# Install Docker if not exists
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# Install Docker Compose if not exists
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Create app directory
sudo mkdir -p /opt/ppid
cd /opt/ppid

# Create docker-compose.yml
sudo tee docker-compose.yml > /dev/null << 'EOF'
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
    image: your-dockerhub-username/ppid-master:latest
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: "postgresql://postgres:postgres123@postgres:5432/ppid_garut?schema=public"
      JWT_SECRET: "ppid-garut-production-secret-2025"
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
sudo mkdir -p uploads
sudo chmod 755 uploads

# Start services
echo "Starting services..."
sudo docker-compose pull
sudo docker-compose up -d

# Install and configure Nginx
echo "Setting up Nginx..."
sudo apt update
sudo apt install -y nginx

# Create Nginx config
sudo tee /etc/nginx/sites-available/ppid > /dev/null << 'EOF'
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
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
EOF

# Enable site
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/ppid /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Configure firewall
echo "Configuring firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
echo "y" | sudo ufw enable

echo "✅ Deployment complete!"
echo "🌐 Access: http://$(curl -s ifconfig.me)"
echo "📊 Admin: admin@garut.go.id / Garut@2025?"
echo ""
echo "Management commands:"
echo "  sudo docker-compose -f /opt/ppid/docker-compose.yml logs -f"
echo "  sudo docker-compose -f /opt/ppid/docker-compose.yml restart"