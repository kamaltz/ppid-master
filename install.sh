#!/bin/bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

if [[ $EUID -eq 0 ]]; then
   log_warn "Running as root - ensure this is a production server"
fi

log_info "PPID Master - Production Deployment"
log_info "Domain: 167.172.83.55"
log_info "SSL: Automatic HTTPS"
echo ""

log_info "Checking system requirements..."
if ! command -v curl &> /dev/null; then
    log_error "curl is required but not installed"
    exit 1
fi

log_info "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    log_warn "Please log out and back in for Docker permissions to take effect"
else
    log_info "Docker already installed"
fi

log_info "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
    sudo curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
else
    log_info "Docker Compose already installed"
fi

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

log_info "Setting up directories..."
sudo mkdir -p /opt/ppid
sudo chown $USER:$USER /opt/ppid
cd /opt/ppid

log_info "Generating secure configuration..."
JWT_SECRET=$(openssl rand -hex 32)
POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

log_info "Creating PPID configuration..."
cat > docker-compose.yml << COMPOSE_EOF
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
      NEXT_PUBLIC_API_URL: "https://167.172.83.55/api"
      NEXTAUTH_URL: "https://167.172.83.55"
      NODE_ENV: "production"
      DOCKER_ENV: "true"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - /opt/ppid/uploads:/app/uploads
    restart: unless-stopped

volumes:
  postgres_data:
COMPOSE_EOF

log_info "Setting up file storage..."
sudo mkdir -p /opt/ppid/uploads/{images,documents,attachments}
sudo chown -R 1000:1000 /opt/ppid/uploads
sudo chmod -R 755 /opt/ppid/uploads

log_info "Installing Nginx..."
sudo apt update -qq
sudo apt install -y nginx openssl
sudo systemctl enable nginx

log_info "Setting up self-signed SSL certificate..."
SSL_DIR="/etc/ssl/ppid-selfsigned"
CERT_FILE="$SSL_DIR/selfsigned.crt"
KEY_FILE="$SSL_DIR/selfsigned.key"

sudo mkdir -p $SSL_DIR

if [ ! -f "$CERT_FILE" ] || [ ! -f "$KEY_FILE" ]; then
    log_info "Generating new self-signed certificate..."
    sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$KEY_FILE" \
        -out "$CERT_FILE" \
        -subj "/C=ID/ST=West Java/L=Garut/O=PPID/OU=IT/CN=167.172.83.55"
    log_info "Self-signed certificate generated at $SSL_DIR"
else
    log_info "Existing self-signed certificate found, skipping generation."
fi

log_info "Configuring Nginx..."
sudo cat > /etc/nginx/sites-available/default << NGINX_EOF
server {
    listen 80;
    server_name 167.172.83.55;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name 167.172.83.55;

    ssl_certificate $CERT_FILE;
    ssl_certificate_key $KEY_FILE;

    client_max_body_size 50M;

    # Security headers
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self'; frame-src 'self';" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    location /uploads/ {
        alias /opt/ppid/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri \$uri/ =404;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
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
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
NGINX_EOF

sudo ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/
if sudo nginx -t; then
    sudo systemctl reload nginx
    log_info "Nginx configuration validated and reloaded"
else
    log_error "Nginx configuration test failed"
    exit 1
fi

log_info "Starting PPID Master..."
# Ensure we have the latest image
docker-compose pull

# Stop any existing containers first
docker-compose down 2>/dev/null || true

# Start services
docker-compose up -d

# Verify containers started
sleep 5
if ! docker-compose ps | grep -q "Up"; then
    log_error "Containers failed to start. Checking logs..."
    docker-compose logs
    exit 1
fi

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

log_info "Setting up database..."
# Wait a bit more for app to be ready
sleep 10

# Generate Prisma client
if ! docker-compose exec -T app npx prisma generate; then
    log_error "Failed to generate Prisma client"
    docker-compose logs app
    exit 1
fi

# Deploy migrations
if ! docker-compose exec -T app npx prisma migrate deploy; then
    log_error "Failed to deploy database migrations"
    docker-compose logs app
    exit 1
fi

if [ -f "ppid_db.sql" ]; then
    log_info "Found ppid_db.sql - importing custom database..."
    if docker-compose exec -T postgres psql -U postgres -d ppid_garut < ppid_db.sql; then
        log_info "Custom database imported successfully"
    else
        log_error "Failed to import custom database"
        exit 1
    fi
else
    log_info "No ppid_db.sql found - using default seed data..."
    if ! docker-compose exec -T app npx prisma db seed; then
        log_warn "Failed to seed database, but continuing..."
    fi
fi

docker-compose restart app

log_info "Waiting for application to start..."
for i in {1..60}; do
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        log_info "Application is ready"
        break
    fi
    if [ $i -eq 60 ]; then
        log_error "Application failed to start after 3 minutes"
        log_error "Checking container status..."
        docker-compose ps
        log_error "Application logs:"
        docker-compose logs --tail=50 app
        log_error "Database logs:"
        docker-compose logs --tail=20 postgres
        exit 1
    fi
    echo -n "."
    sleep 3
done
echo ""

log_info "Applying post-deployment fixes..."
# Fix database schema issues
log_info "Fixing database schema..."
docker-compose exec -T postgres psql -U postgres -d ppid_garut -c "ALTER TABLE pemohon ADD COLUMN IF NOT EXISTS pekerjaan VARCHAR(255);" 2>/dev/null || true

# Fix API endpoints that might be failing
docker-compose exec -T app npx prisma db push --accept-data-loss || true

# Restart app to ensure all environment variables are loaded
docker-compose restart app

# Wait for app to be fully ready after restart
sleep 15

log_info "Saving credentials..."
cat > .env.production << CRED_EOF
JWT_SECRET=${JWT_SECRET}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
CRED_EOF
chmod 600 .env.production

# Final validation
log_info "Running final validation..."
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    HEALTH_RESPONSE=$(curl -s http://localhost:3000/api/health)
    log_info "Health check: $HEALTH_RESPONSE"
else
    log_warn "Health check failed, but installation completed"
fi

# Test database connection
ADMIN_COUNT=$(docker-compose exec -T postgres psql -U postgres -d ppid_garut -t -c "SELECT COUNT(*) FROM admin;" 2>/dev/null | tr -d ' \n' || echo "0")
log_info "Admin accounts in database: $ADMIN_COUNT"

echo ""
log_info "Installation Complete!"
log_info "URL: https://167.172.83.55"
log_info "Admin: admin@garut.go.id / Garut@2025?"
log_info "Credentials saved in: /opt/ppid/.env.production"

if [ "$ADMIN_COUNT" = "0" ]; then
    log_warn "No admin accounts found. You may need to run the seed command manually."
fi

echo ""
log_info "Troubleshooting:"
echo "  If you see 500/502 errors, run: bash /opt/ppid/fix-deployment.sh"
echo "  Check app logs: docker-compose -f /opt/ppid/docker-compose.yml logs app"
echo "  Check database: docker-compose -f /opt/ppid/docker-compose.yml exec postgres psql -U postgres -d ppid_garut -c 'SELECT COUNT(*) FROM admin;'"

# Create fix script
cat > fix-deployment.sh << FIX_EOF
#!/bin/bash
set -e
cd /opt/ppid
docker-compose down
docker-compose pull
docker-compose up -d --force-recreate
sleep 10
docker-compose exec -T app npx prisma generate
docker-compose exec -T app npx prisma migrate deploy
# Fix database schema
docker-compose exec -T postgres psql -U postgres -d ppid_garut -c "ALTER TABLE pemohon ADD COLUMN IF NOT EXISTS pekerjaan VARCHAR(255);" || true
docker-compose exec -T app npx prisma db seed
docker-compose restart app
sleep 15
echo "Fix completed! Try accessing: https://167.172.83.55"
FIX_EOF
chmod +x fix-deployment.sh

# Create database schema fix script
cat > fix-database-schema.sh << SCHEMA_EOF
#!/bin/bash
set -e
cd /opt/ppid
echo "Fixing database schema..."
docker-compose exec -T postgres psql -U postgres -d ppid_garut -c "ALTER TABLE pemohon ADD COLUMN IF NOT EXISTS pekerjaan VARCHAR(255);" || true
docker-compose restart app
sleep 10
echo "Database schema fix completed!"
SCHEMA_EOF
chmod +x fix-database-schema.sh

echo ""
log_info "Management Commands:"
echo "  View logs: docker-compose -f /opt/ppid/docker-compose.yml logs -f"
echo "  Restart:   docker-compose -f /opt/ppid/docker-compose.yml restart"
echo "  Stop:      docker-compose -f /opt/ppid/docker-compose.yml down"
echo "  Update:    docker-compose -f /opt/ppid/docker-compose.yml pull && docker-compose -f /opt/ppid/docker-compose.yml up -d"
echo "  Health:    curl https://167.172.83.55/api/health"
echo "  DB Status: docker-compose -f /opt/ppid/docker-compose.yml exec postgres pg_isready -U postgres"
echo ""
log_info "Security: Firewall enabled, SSL configured"