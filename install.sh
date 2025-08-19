#!/bin/bash
set -e

echo "🚀 PPID Master - Production Deployment"
echo "Domain: ppidgarut.kamaltz.fun"
echo "SSL: Automatic HTTPS"
echo ""

# Install Docker
echo "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
fi

# Install Docker Compose
echo "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Configure firewall first
echo "Configuring firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
echo "y" | sudo ufw enable 2>/dev/null || true

# Create directories
echo "Setting up directories..."
sudo mkdir -p /opt/ppid
cd /opt/ppid

# Create PPID docker-compose
echo "Creating PPID configuration..."
sudo tee docker-compose.yml > /dev/null << 'EOF'
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
      - "127.0.0.1:3000:3000"
    environment:
      DATABASE_URL: "postgresql://postgres:postgres123@postgres:5432/ppid_garut?schema=public"
      JWT_SECRET: "ppid-garut-production-secret-2025"
      NEXT_PUBLIC_API_URL: "https://ppidgarut.kamaltz.fun/api"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - /opt/ppid/uploads:/app/public/uploads
    restart: unless-stopped

volumes:
  postgres_data:
EOF

# Setup uploads
echo "Setting up file storage..."
sudo mkdir -p /opt/ppid/uploads/images
sudo chown -R 1001:1001 /opt/ppid/uploads
sudo chmod -R 755 /opt/ppid/uploads

# Install and configure Nginx
echo "Installing Nginx..."
sudo apt update -qq
sudo apt install -y nginx

# Create Nginx config
echo "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/ppid-master << 'EOF'
server {
    listen 80;
    server_name ppidgarut.kamaltz.fun www.ppidgarut.kamaltz.fun;
    client_max_body_size 50M;

    location /uploads/ {
        alias /opt/ppid/uploads/;
        expires 1y;
        add_header Cache-Control "public";
        try_files $uri $uri/ =404;
    }

    location /_next/image {
        return 404;
    }

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

# Start PPID services
echo "Starting PPID Master..."
sudo docker-compose pull
sudo docker-compose up -d
sleep 45

# Setup database
echo "Setting up database..."
sudo docker-compose exec -T app npx prisma generate
sudo docker-compose exec -T app npx prisma migrate deploy
sudo docker-compose exec -T app npx prisma db seed
sudo docker-compose restart app
sleep 15

# Setup SSL with Let's Encrypt
echo "Setting up SSL certificate..."
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d ppidgarut.kamaltz.fun -d www.ppidgarut.kamaltz.fun --non-interactive --agree-tos --email admin@kamaltz.fun

echo ""
echo "✅ Installation Complete!"
echo "🌐 URL: https://ppidgarut.kamaltz.fun"
echo "📊 Admin: admin@garut.go.id / Garut@2025?"
echo ""
echo "Management:"
echo "  sudo docker-compose -f /opt/ppid/docker-compose.yml logs -f"
echo "  sudo docker-compose -f /opt/ppid/docker-compose.yml restart"