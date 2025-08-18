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

# Create directories
echo "Setting up directories..."
sudo mkdir -p /opt/ppid /opt/caddy
cd /opt/ppid

# Create network
docker network create proxy 2>/dev/null || true

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
    expose:
      - "3000"
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
    networks:
      - proxy

volumes:
  postgres_data:

networks:
  proxy:
    external: true
EOF

# Setup uploads
echo "Setting up file storage..."
sudo mkdir -p /opt/ppid/uploads/images
sudo chown -R 1001:1001 /opt/ppid/uploads
sudo chmod -R 755 /opt/ppid/uploads

# Create Caddyfile
echo "Setting up Caddy proxy..."
sudo tee /opt/caddy/Caddyfile > /dev/null << 'EOF'
ppidgarut.kamaltz.fun {
    reverse_proxy ppid-app-1:3000
    
    handle_path /uploads/* {
        root * /opt/ppid/uploads
        file_server
    }
    
    header {
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        X-XSS-Protection "1; mode=block"
    }
}
EOF

# Create Caddy docker-compose
sudo tee /opt/caddy-compose.yml > /dev/null << 'EOF'
services:
  caddy:
    image: caddy:latest
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /opt/caddy/Caddyfile:/etc/caddy/Caddyfile
      - /opt/ppid/uploads:/opt/ppid/uploads
      - caddy_data:/data
      - caddy_config:/config
    networks:
      - proxy

volumes:
  caddy_data:
  caddy_config:

networks:
  proxy:
    external: true
EOF

# Start services
echo "Starting Caddy..."
sudo docker-compose -f /opt/caddy-compose.yml up -d

echo "Starting PPID Master..."
sudo docker-compose pull
sudo docker-compose up -d

echo "Waiting for services..."
sleep 45

# Setup database
echo "Setting up database..."
sudo docker-compose exec -T app npx prisma generate
sudo docker-compose exec -T app npx prisma db push --force-reset --accept-data-loss
sudo docker-compose exec -T app npx prisma db seed
sudo docker-compose restart app
sleep 15

# Configure firewall
echo "Configuring firewall..."
sudo ufw allow 22 >/dev/null 2>&1
sudo ufw allow 80 >/dev/null 2>&1
sudo ufw allow 443 >/dev/null 2>&1
echo "y" | sudo ufw enable >/dev/null 2>&1 || true

echo ""
echo "✅ Installation Complete!"
echo "🌐 URL: https://ppidgarut.kamaltz.fun"
echo "📊 Admin: admin@garut.go.id / Garut@2025?"
echo ""
echo "Management:"
echo "  sudo docker-compose -f /opt/ppid/docker-compose.yml logs -f"
echo "  sudo docker-compose -f /opt/ppid/docker-compose.yml restart"