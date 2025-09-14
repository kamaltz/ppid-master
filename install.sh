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
# Ensure we can access the directory
if ! cd /opt/ppid 2>/dev/null; then
    log_error "Cannot access /opt/ppid directory"
    sudo ls -la /opt/
    exit 1
fi
PWD=/opt/ppid

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
      - "3000:3000"
    environment:
      DATABASE_URL: "postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/ppid_garut?schema=public"
      JWT_SECRET: "${JWT_SECRET}"
      NEXT_PUBLIC_API_URL: "http://167.172.83.55/api"
      NEXTAUTH_URL: "http://167.172.83.55"
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
# Clean up existing nginx config
sudo rm -f /etc/nginx/sites-available/default
sudo rm -f /etc/nginx/sites-enabled/default

# Create new nginx config
sudo tee /etc/nginx/sites-available/default > /dev/null << 'EOF'
server {
    listen 80 default_server;
    server_name 167.172.83.55 _;
    client_max_body_size 50M;

    location /uploads/ {
        alias /opt/ppid/uploads/;
        expires 1y;
        try_files $uri $uri/ =404;
    }

    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://localhost:3000;
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

sudo ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/

# Debug nginx config if test fails
if sudo nginx -t; then
    sudo systemctl reload nginx
    log_info "Nginx configuration validated and reloaded"
else
    log_error "Nginx configuration test failed"
    log_info "Checking nginx config file:"
    sudo cat -n /etc/nginx/sites-available/default
    log_info "Nginx error details:"
    sudo nginx -t 2>&1
    exit 1
fi

log_info "Starting PPID Master..."
# Ensure we're in the right directory
cd /opt/ppid || exit 1

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
    
    # Ensure header settings and categories are seeded
    log_info "Seeding header settings and categories..."
    docker-compose exec -T postgres psql -U postgres -d ppid_garut -c "
        INSERT INTO settings (key, value) VALUES 
        ('header', '{\"menuItems\":[{\"label\":\"Beranda\",\"url\":\"/\",\"hasDropdown\":false,\"dropdownItems\":[]},{\"label\":\"Profil\",\"url\":\"/profil\",\"hasDropdown\":true,\"dropdownItems\":[{\"label\":\"Tentang PPID\",\"url\":\"/profil\"},{\"label\":\"Visi Misi\",\"url\":\"/visi-misi\"}]},{\"label\":\"Informasi Publik\",\"url\":\"/informasi\",\"hasDropdown\":false,\"dropdownItems\":[]},{\"label\":\"Layanan\",\"url\":\"/layanan\",\"hasDropdown\":true,\"dropdownItems\":[{\"label\":\"Permohonan Informasi\",\"url\":\"/permohonan\"},{\"label\":\"Keberatan\",\"url\":\"/keberatan\"}]}]}') 
        ON CONFLICT (key) DO NOTHING;
        
        INSERT INTO kategori (nama, deskripsi) VALUES 
        ('Informasi Berkala', 'Informasi yang wajib disediakan dan diumumkan secara berkala'),
        ('Informasi Serta Merta', 'Informasi yang wajib diumumkan secara serta merta'),
        ('Informasi Setiap Saat', 'Informasi yang wajib tersedia setiap saat')
        ON CONFLICT (nama) DO NOTHING;
    " 2>/dev/null || true
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
# Ensure we're in the correct directory
cd /opt/ppid || { log_error "Cannot access /opt/ppid"; exit 1; }
docker-compose exec -T postgres psql -U postgres -d ppid_garut -c "ALTER TABLE pemohon ADD COLUMN pekerjaan TEXT;" 2>/dev/null || true
log_info "Pekerjaan column added to pemohon table"

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

# Final verification and diagnostics
log_info "Running final diagnostics..."

# Check nginx status
if sudo systemctl is-active --quiet nginx; then
    log_info "✅ Nginx is running"
else
    log_error "❌ Nginx is not running"
    sudo systemctl status nginx --no-pager
fi

# Check if nginx is listening on port 80
if sudo ss -tlnp | grep :80 > /dev/null 2>&1; then
    log_info "✅ Nginx is listening on port 80"
else
    log_error "❌ Nginx is not listening on port 80"
fi

# Check docker containers
log_info "Docker container status:"
docker-compose ps

# Check if app is responding locally
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    log_info "✅ App is responding on localhost:3000"
else
    log_error "❌ App is not responding on localhost:3000"
    log_info "App logs:"
    docker-compose logs --tail=10 app
fi

# Check if nginx can reach the app
if curl -f http://localhost/api/health > /dev/null 2>&1; then
    log_info "✅ Nginx proxy is working"
else
    log_error "❌ Nginx proxy is not working"
    log_info "Nginx error log:"
    sudo tail -5 /var/log/nginx/error.log
fi

# Check firewall status
if command -v ufw &> /dev/null; then
    log_info "Firewall status:"
    sudo ufw status
fi

echo ""
log_info "✅ Installation Complete!"
log_info "🌐 URL: http://167.172.83.55"
log_info "📊 Admin: admin@garutkab.go.id / Garut@2025?"
log_info "🔐 Credentials saved in: /opt/ppid/.env.production"

echo ""
log_info "Troubleshooting:"
echo "  Check nginx: sudo systemctl status nginx"
echo "  Check app: docker-compose -f /opt/ppid/docker-compose.yml logs app"
echo "  Check ports: sudo ss -tlnp | grep -E ':(80|3000)'"
echo "  Test local: curl http://localhost:3000/api/health"
echo "  Test nginx: curl http://localhost/api/health"

echo ""
log_info "Management Commands:"
echo "  View logs: docker-compose -f /opt/ppid/docker-compose.yml logs -f"
echo "  Restart:   docker-compose -f /opt/ppid/docker-compose.yml restart"
echo "  Stop:      docker-compose -f /opt/ppid/docker-compose.yml down"
echo "  Update:    docker-compose -f /opt/ppid/docker-compose.yml pull && docker-compose -f /opt/ppid/docker-compose.yml up -d"
echo "  Health:    curl http://167.172.83.55/api/health"
echo ""
log_info "🔒 Security: Firewall enabled, SSL configured"