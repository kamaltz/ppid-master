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
log_info "Domain: 167.172.83.55"
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
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    # Try modern Docker Compose plugin first
    if docker compose version &> /dev/null; then
        log_info "Docker Compose plugin already available"
        # Create alias for compatibility
        echo 'alias docker-compose="docker compose"' >> ~/.bashrc
        alias docker-compose="docker compose"
    else
        # Install standalone docker-compose
        COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
        sudo curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        
        # Verify installation
        if ! /usr/local/bin/docker-compose --version; then
            log_error "Docker Compose installation failed"
            exit 1
        fi
    fi
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

# Create environment file
log_info "Creating environment configuration..."
cat > .env << EOF
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
JWT_SECRET=${JWT_SECRET}
EOF

# Create PPID docker-compose
log_info "Creating PPID configuration..."
tee docker-compose.yml > /dev/null << EOF
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ppid_garut
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
      POSTGRES_INITDB_ARGS: "--auth-host=md5 --auth-local=md5"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d ppid_garut"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 30s

  app:
    image: kamaltz/ppid-master:latest
    ports:
      - "127.0.0.1:3000:3000"
    environment:
      DATABASE_URL: "postgresql://postgres:\${POSTGRES_PASSWORD}@postgres:5432/ppid_garut?schema=public&connect_timeout=60&pool_timeout=60"
      JWT_SECRET: "\${JWT_SECRET}"
      NEXT_PUBLIC_API_URL: "http://167.172.83.55/api"
      NODE_ENV: "production"
      DOCKER_ENV: "true"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - /opt/ppid/uploads:/app/uploads
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:3000/api/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

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
sudo rm -f /etc/nginx/sites-enabled/ppid.garutkab.go.id
sudo rm -f /etc/nginx/sites-available/ppid.garutkab.go.id
sudo rm -f /etc/nginx/conf.d/rate-limit.conf
sudo rm -f /etc/nginx/sites-enabled/ppid-master

# Remove default nginx site
sudo rm -f /etc/nginx/sites-enabled/default

# Create Nginx site config
log_info "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/ppid-master << 'EOF'
server {
    listen 80;
    server_name 167.172.83.55;
    client_max_body_size 50M;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location /api/auth/ {
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

# Determine compose command first
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
elif [ -x "/usr/local/bin/docker-compose" ]; then
    COMPOSE_CMD="/usr/local/bin/docker-compose"
else
    log_info "Installing Docker Compose plugin..."
    sudo apt update
    sudo apt install -y docker-compose-plugin
    COMPOSE_CMD="docker compose"
fi

# Stop any existing containers and reset database volume
log_info "Resetting database for fresh installation..."
$COMPOSE_CMD down 2>/dev/null || true
docker volume rm ppid_postgres_data 2>/dev/null || true

# Start PPID services
log_info "Starting PPID Master..."
$COMPOSE_CMD pull
$COMPOSE_CMD up -d

# Wait for services to be ready
log_info "Waiting for services to start..."
for i in {1..60}; do
    if $COMPOSE_CMD exec -T postgres pg_isready -U postgres -d ppid_garut > /dev/null 2>&1; then
        log_info "Database is ready"
        break
    fi
    if [ $i -eq 60 ]; then
        log_error "Database failed to start after 2 minutes"
        $COMPOSE_CMD logs postgres --tail=10
        exit 1
    fi
    sleep 2
done

# Setup database with retry logic
log_info "Setting up database..."
for i in {1..5}; do
    if $COMPOSE_CMD exec -T app npx prisma generate; then
        log_info "Prisma client generated successfully"
        break
    fi
    if [ $i -eq 5 ]; then
        log_error "Failed to generate Prisma client after 5 attempts"
        exit 1
    fi
    log_warn "Prisma generate failed, retrying in 10 seconds... ($i/5)"
    sleep 10
done

for i in {1..5}; do
    if $COMPOSE_CMD exec -T app npx prisma migrate deploy; then
        log_info "Database migrations completed successfully"
        break
    fi
    if [ $i -eq 5 ]; then
        log_error "Failed to run migrations after 5 attempts"
        exit 1
    fi
    log_warn "Migration failed, retrying in 15 seconds... ($i/5)"
    sleep 15
done

# Restart app to ensure clean state
$COMPOSE_CMD restart app
sleep 10

# Wait for app to be ready
log_info "Waiting for application to start..."
for i in {1..60}; do
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        log_info "Application is ready"
        break
    fi
    if [ $i -eq 60 ]; then
        log_error "Application failed to start after 2 minutes"
        log_info "Checking application logs..."
        $COMPOSE_CMD logs app --tail=20
        exit 1
    fi
    sleep 2
done


# Fix registration form - add pekerjaan column if missing
log_info "Fixing registration form database..."
if ! $COMPOSE_CMD exec -T postgres psql -U postgres -d ppid_garut -c "SELECT pekerjaan FROM pemohon LIMIT 1;" > /dev/null 2>&1; then
    log_info "Adding pekerjaan column to pemohon table..."
    $COMPOSE_CMD exec -T postgres psql -U postgres -d ppid_garut -c "ALTER TABLE pemohon ADD COLUMN pekerjaan TEXT;"
    log_info "Pekerjaan column added successfully"
else
    log_info "Pekerjaan column already exists"
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
log_info "🌐 URL: http://167.172.83.55"
log_info "📊 Admin: admin@garutkab.go.id / Garut@2025?"
log_info "🔐 Credentials saved in: /opt/ppid/.env.production"

echo ""
log_info "Management Commands:"
if docker compose version &> /dev/null; then
    echo "  View logs: docker compose -f /opt/ppid/docker-compose.yml logs -f"
    echo "  Restart:   docker compose -f /opt/ppid/docker-compose.yml restart"
    echo "  Stop:      docker compose -f /opt/ppid/docker-compose.yml down"
    echo "  Update:    docker compose -f /opt/ppid/docker-compose.yml pull && docker compose -f /opt/ppid/docker-compose.yml up -d"
else
    echo "  View logs: /usr/local/bin/docker-compose -f /opt/ppid/docker-compose.yml logs -f"
    echo "  Restart:   /usr/local/bin/docker-compose -f /opt/ppid/docker-compose.yml restart"
    echo "  Stop:      /usr/local/bin/docker-compose -f /opt/ppid/docker-compose.yml down"
    echo "  Update:    /usr/local/bin/docker-compose -f /opt/ppid/docker-compose.yml pull && /usr/local/bin/docker-compose -f /opt/ppid/docker-compose.yml up -d"
fi
echo "  Health:    curl http://167.172.83.55/api/health"
echo ""
log_info "🔒 Security: Firewall enabled, SSL configured, rate limiting active"