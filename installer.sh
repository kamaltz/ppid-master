#!/bin/bash
set -eo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Allow root for production deployment
if [[ $EUID -eq 0 ]]; then
   log_warn "Running as root - ensure this is a production server"
fi

log_info "🚀 PPID Master - Production Deployment"
log_info "Domain: ppid.garutkab.go.id"
log_info "SSL: Automatic HTTPS"
echo ""

# Check system requirements
log_info "Checking system requirements..."
if ! command -v curl &> /dev/null; then
    log_error "curl is required but not installed"
    exit 1
fi

# Install Docker
log_info "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    log_warn "Please log out and back in for Docker permissions to take effect"
else
    log_info "Docker already installed"
fi

# Install Docker Compose
log_info "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
    sudo curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
else
    log_info "Docker Compose already installed"
fi

# Configure firewall
log_info "Configuring firewall..."
if command -v ufw &> /dev/null; then
    sudo ufw --force enable
    sudo ufw allow 22/tcp comment 'SSH'
    sudo ufw allow 80/tcp comment 'HTTP'
    sudo ufw allow 443/tcp comment 'HTTPS'
    sudo ufw reload
else
    log_warn "UFW not available, skipping firewall configuration"
fi

# Create directories with proper permissions
log_info "Setting up directories..."
sudo mkdir -p /opt/ppid
sudo chown $USER:$USER /opt/ppid
cd /opt/ppid

# Generate secure secrets
log_info "Generating secure configuration..."
JWT_SECRET=${JWT_SECRET:-$(openssl rand -hex 32)}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)}

# Validate required variables
if [[ -z "${JWT_SECRET:-}" ]] || [[ -z "${POSTGRES_PASSWORD:-}" ]]; then
    log_error "Failed to generate required secrets"
    exit 1
fi

# Create PPID docker-compose
log_info "Creating PPID configuration..."
tee docker-compose.yml > /dev/null << EOF
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ppid_garut
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
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
      DATABASE_URL: "postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/ppid_garut?schema=public"
      JWT_SECRET: "${JWT_SECRET}"
      NEXT_PUBLIC_API_URL: "https://ppid.garutkab.go.id/api"
      DOCKER_ENV: "true"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - /opt/ppid/uploads:/app/uploads
    restart: unless-stopped

volumes:
  postgres_data:
EOF

# Setup uploads with proper security
log_info "Setting up file storage..."
sudo mkdir -p /opt/ppid/uploads/images
# Set ownership to node user (UID 1000) and make writable
sudo chown -R 1000:1000 /opt/ppid/uploads
sudo chmod -R 777 /opt/ppid/uploads

# Install required packages
log_info "Installing required packages..."
sudo apt update -qq
sudo apt install -y nginx dnsutils
sudo systemctl enable nginx

# Clean up any existing configurations
sudo rm -f /etc/nginx/sites-enabled/ppid.garut.go.id
sudo rm -f /etc/nginx/sites-available/ppid.garut.go.id

# Add rate limiting to nginx.conf
log_info "Configuring rate limiting..."
sudo sed -i '/# PPID Rate Limiting/,+2d' /etc/nginx/nginx.conf
sudo sed -i '/http {/a\    # PPID Rate Limiting\n    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/m;\n    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;' /etc/nginx/nginx.conf

# Remove default nginx site
sudo rm -f /etc/nginx/sites-enabled/default

# Create Nginx site config
log_info "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/ppid-master << 'EOF'
server {
    listen 80;
    server_name ppid.garutkab.go.id;
    client_max_body_size 50M;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location /api/auth/ {
        limit_req zone=login burst=3 nodelay;
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

    location /api/ {
        limit_req zone=api burst=10 nodelay;
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

    location /uploads/ {
        alias /opt/ppid/uploads/;
        expires 1y;
        add_header Cache-Control "public";
        try_files $uri $uri/ =404;
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
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/ppid-master /etc/nginx/sites-enabled/
if sudo nginx -t; then
    sudo systemctl reload nginx
    log_info "Nginx configuration validated and reloaded"
else
    log_error "Nginx configuration test failed"
    exit 1
fi

# Start PPID services
log_info "Starting PPID Master..."
docker-compose pull
docker-compose up -d

# Wait for services to be ready
log_info "Waiting for services to start..."
for i in {1..30}; do
    if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        log_info "Database is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "Database failed to start"
        exit 1
    fi
    sleep 2
done

# Setup database
log_info "Setting up database..."
docker-compose exec -T app npx prisma generate
docker-compose exec -T app npx prisma migrate deploy


docker-compose restart app

# Wait for app to be ready
log_info "Waiting for application to start..."
for i in {1..30}; do
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        log_info "Application is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "Application failed to start"
        exit 1
    fi
    sleep 2
done

# Install certbot first
log_info "Installing certbot..."
sudo apt update -qq
sudo apt install -y snapd
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -sf /snap/bin/certbot /usr/bin/certbot

# Verify domain is pointing to this server
log_info "Verifying domain configuration..."
DOMAIN_IP=$(dig +short ppid.garutkab.go.id)
SERVER_IP=$(curl -s ifconfig.me)
if [[ "$DOMAIN_IP" != "$SERVER_IP" ]]; then
    log_warn "Domain ppid.garutkab.go.id ($DOMAIN_IP) does not point to this server ($SERVER_IP)"
    log_warn "Please update DNS records and run: sudo certbot --nginx -d ppid.garutkab.go.id"
else
    log_info "Domain correctly points to this server"
    
    # Setup SSL with Let's Encrypt
    log_info "Setting up SSL certificate..."
    if sudo certbot --nginx -d ppid.garutkab.go.id --non-interactive --agree-tos --email cs@kamaltz.fun --redirect; then
        log_info "SSL certificate installed successfully"
        
        # Test auto-renewal
        sudo certbot renew --dry-run
        
        # Setup auto-renewal cron job
        echo "0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx" | sudo crontab -
        log_info "Auto-renewal configured"
        
        # Restart nginx to apply SSL
        sudo systemctl restart nginx
    else
        log_warn "SSL certificate installation failed"
        log_info "You can manually run: sudo certbot --nginx -d ppid.garutkab.go.id"
    fi
fi




# Save credentials securely
log_info "Saving credentials..."
cat > .env.production << EOF
JWT_SECRET=${JWT_SECRET}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
EOF
chmod 600 .env.production

echo ""
log_info "✅ Installation Complete!"
log_info "🌐 URL: https://ppid.garutkab.go.id"
log_info "📊 Admin: admin@garut.go.id / Garut@2025?"
log_info "🔐 Credentials saved in: /opt/ppid/.env.production"

echo ""
log_info "Management Commands:"
echo "  View logs: docker-compose -f /opt/ppid/docker-compose.yml logs -f"
echo "  Restart:   docker-compose -f /opt/ppid/docker-compose.yml restart"
echo "  Stop:      docker-compose -f /opt/ppid/docker-compose.yml down"
echo "  Update:    docker-compose -f /opt/ppid/docker-compose.yml pull && docker-compose -f /opt/ppid/docker-compose.yml up -d"
echo "  Health:    curl https://ppid.garutkab.go.id/api/health"
echo ""
log_info "🔒 Security: Firewall enabled, SSL configured, rate limiting active"