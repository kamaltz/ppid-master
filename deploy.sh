#!/bin/bash
set -e

echo "🚀 PPID Master - Complete Deployment"

# Get domain input
read -p "Enter your domain (or press Enter for IP-only access): " DOMAIN
if [ -z "$DOMAIN" ]; then
    DOMAIN="_"
    USE_SSL="false"
else
    read -p "Setup SSL certificate for $DOMAIN? (y/n): " SSL_CHOICE
    if [ "$SSL_CHOICE" = "y" ]; then
        USE_SSL="true"
    else
        USE_SSL="false"
    fi
fi

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
sudo mkdir -p /opt/ppid
cd /opt/ppid

# Create docker-compose.yml
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
      NEXT_PUBLIC_API_URL: "http://localhost:3000/api"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - /opt/ppid/uploads:/app/public/uploads
    restart: unless-stopped

volumes:
  postgres_data:
EOF

# Create uploads directory with correct permissions
sudo mkdir -p /opt/ppid/uploads/images
sudo chown -R 1001:1001 /opt/ppid/uploads
sudo chmod -R 755 /opt/ppid/uploads

# Start services
echo "Starting PPID Master..."
sudo docker-compose pull
sudo docker-compose up -d

# Wait for services
echo "Waiting for services..."
sleep 45

# Force database setup
echo "Setting up database..."
sudo docker-compose exec -T app sh -c "
npx prisma generate
npx prisma db push --force-reset --accept-data-loss
npx prisma db seed
" || echo "Database setup completed with warnings"

# Restart app
sudo docker-compose restart app
sleep 15

# Install and configure Nginx
echo "Setting up Nginx..."
sudo apt update
sudo apt install -y nginx

# Create Nginx config
if [ "$DOMAIN" = "_" ]; then
    SERVER_NAME="_"
else
    SERVER_NAME="$DOMAIN www.$DOMAIN"
fi

sudo tee /etc/nginx/sites-available/ppid-master << EOF
server {
    listen 80;
    server_name $SERVER_NAME;
    client_max_body_size 50M;

    # Serve uploads directly from filesystem
    location /uploads/ {
        alias /opt/ppid/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri \$uri/ =404;
    }

    # Proxy all other requests to app
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
EOF

# Enable site
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/ppid-master /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Setup SSL if requested
if [ "$USE_SSL" = "true" ]; then
    echo "Setting up SSL certificate..."
    sudo apt install -y certbot python3-certbot-nginx
    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
fi

# Configure firewall
echo "Configuring firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
echo "y" | sudo ufw enable 2>/dev/null || true

# Get public IP
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "YOUR_SERVER_IP")

echo ""
echo "✅ PPID Master deployed successfully!"
echo ""
if [ "$DOMAIN" = "_" ]; then
    echo "🌐 Access: http://$PUBLIC_IP"
else
    if [ "$USE_SSL" = "true" ]; then
        echo "🌐 Access: https://$DOMAIN"
    else
        echo "🌐 Access: http://$DOMAIN"
    fi
fi
echo ""
echo "📊 Default Accounts:"
echo "   Admin: admin@garut.go.id / Garut@2025?"
echo "   PPID Utama: ppid.utama@garut.go.id / Garut@2025?"
echo "   Pemohon: pemohon@example.com / Garut@2025?"
echo ""
echo "📋 Management Commands:"
echo "   View logs: sudo docker-compose -f /opt/ppid/docker-compose.yml logs -f"
echo "   Restart: sudo docker-compose -f /opt/ppid/docker-compose.yml restart"
echo "   Update: sudo docker-compose -f /opt/ppid/docker-compose.yml pull && sudo docker-compose -f /opt/ppid/docker-compose.yml up -d"
echo ""
echo "📁 Files location: /opt/ppid/"