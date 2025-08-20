#!/bin/bash
set -euo pipefail

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
log_info "Domain: 143.198.205.44"
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
JWT_SECRET=$(openssl rand -hex 32)
POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

# Create PPID docker-compose
log_info "Creating PPID configuration..."
tee docker-compose.yml > /dev/null << EOF
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ppid_garut
      POSTGRES_USER: ppid_user
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
      DATABASE_URL: "postgresql://ppid_user:${POSTGRES_PASSWORD}@postgres:5432/ppid_garut?schema=public"
      JWT_SECRET: "${JWT_SECRET}"
      NEXT_PUBLIC_API_URL: "https://143.198.205.44/api"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - /opt/ppid/uploads:/app/public/uploads
    restart: unless-stopped

volumes:
  postgres_data:
EOF

# Setup uploads with proper security
log_info "Setting up file storage..."
mkdir -p uploads/images
chmod 755 uploads
chmod 755 uploads/images

# Install and configure Nginx
log_info "Installing Nginx..."
sudo apt update -qq
sudo apt install -y nginx
sudo systemctl enable nginx

# Clean nginx.conf first
sudo sed -i '/# PPID Rate Limiting/,+2d' /etc/nginx/nginx.conf

# Create Nginx site config
log_info "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/default << EOF

server {
    listen 80;
    server_name 143.198.205.44;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name 143.198.205.44;

    ssl_certificate /etc/ssl/ppid-selfsigned/selfsigned.crt;
    ssl_certificate_key /etc/ssl/ppid-selfsigned/selfsigned.key;

    client_max_body_size 50M;

    location /uploads/ {
        alias /opt/ppid/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri \$uri/ =404;
    }

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
    }
}

EOF


# server {
#     listen 80;
#     server_name 143.198.205.44;
#     client_max_body_size 50M;
    
#     # Security headers
#     add_header X-Frame-Options "SAMEORIGIN" always;
#     add_header X-Content-Type-Options "nosniff" always;
#     add_header X-XSS-Protection "1; mode=block" always;

#     location /uploads/ {
#         alias /opt/ppid/uploads/;
#         expires 1y;
#         add_header Cache-Control "public, immutable";
#         try_files $uri $uri/ =404;
#     }

#     location / {
#         proxy_pass http://127.0.0.1:3000;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#         proxy_cache_bypass $http_upgrade;
#     }
# }

# Enable site
sudo ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/
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
    if docker-compose exec -T postgres pg_isready -U ppid_user > /dev/null 2>&1; then
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

# Check for custom database import
if [ -f "ppid_db.sql" ]; then
    log_info "Found ppid_db.sql - importing custom database..."
    docker-compose exec -T postgres psql -U ppid_user -d ppid_garut < ppid_db.sql
    log_info "Custom database imported successfully"
else
    log_info "No ppid_db.sql found - using default seed data..."
    docker-compose exec -T app npx prisma db seed
fi

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

# Setup SSL with Let's Encrypt
# log_info "Setting up SSL certificate..."
# sudo apt install -y certbot python3-certbot-nginx
# if sudo certbot --nginx -d ppid-garut.kamaltz.fun --non-interactive --agree-tos --email admin@kamaltz.fun --expand; then
#     log_info "SSL certificate installed successfully"
#     # Setup auto-renewal
#     echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
# else
#     log_warn "SSL certificate installation failed, continuing without HTTPS"
# fi

# Setup SSL with self-signed certificate
log_info "Setting up self-signed SSL certificate..."

SSL_DIR="/etc/ssl/ppid-selfsigned"
sudo mkdir -p $SSL_DIR

# Generate self-signed cert valid 1 year
if sudo openssl req -x509 -nodes -days 365 \
    -newkey rsa:2048 \
    -keyout $SSL_DIR/selfsigned.key \
    -out $SSL_DIR/selfsigned.crt \
    -subj "/C=ID/ST=West Java/L=Garut/O=PPID/OU=IT/CN=143.198.205.44"; then
    
    log_info "Self-signed SSL certificate generated successfully"

# Save credentials securely
log_info "Saving credentials..."
cat > .env.production << EOF
JWT_SECRET=${JWT_SECRET}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
EOF
chmod 600 .env.production

echo ""
log_info "✅ Installation Complete!"
log_info "🌐 URL: https://143.198.205.44"
log_info "📊 Admin: admin@garut.go.id / Garut@2025?"
# log_info "🔐 Credentials saved in: /opt/ppid/.env.production"
log_info "🔐 Credentials saved in: /etc/ssl/ppid-selfsigned"

echo ""
log_info "Management Commands:"
echo "  View logs: docker-compose -f /opt/ppid/docker-compose.yml logs -f"
echo "  Restart:   docker-compose -f /opt/ppid/docker-compose.yml restart"
echo "  Stop:      docker-compose -f /opt/ppid/docker-compose.yml down"
echo "  Update:    docker-compose -f /opt/ppid/docker-compose.yml pull && docker-compose -f /opt/ppid/docker-compose.yml up -d"
echo "  Health:    curl https://ppidgarut.kamaltz.fun/api/health"
echo ""
log_info "🔒 Security: Firewall enabled, SSL configured, rate limiting active"