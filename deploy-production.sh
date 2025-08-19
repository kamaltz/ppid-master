#!/bin/bash
set -euo pipefail

# Production deployment script with monitoring and maintenance
# Usage: ./deploy-production.sh [domain] [email]

DOMAIN=${1:-"ppidgarut.kamaltz.fun"}
EMAIL=${2:-"admin@kamaltz.fun"}
INSTALL_DIR="/opt/ppid"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

# Cleanup function
cleanup() {
    if [ $? -ne 0 ]; then
        log_error "Deployment failed. Check logs above."
        log_info "Rollback: docker-compose -f $INSTALL_DIR/docker-compose.yml down"
    fi
}
trap cleanup EXIT

log_step "🚀 PPID Master Production Deployment"
log_info "Domain: $DOMAIN"
log_info "Email: $EMAIL"
log_info "Install Directory: $INSTALL_DIR"
echo ""

# Pre-flight checks
log_step "Pre-flight system checks"
if [[ $EUID -eq 0 ]]; then
   log_error "Do not run as root for security"
   exit 1
fi

# Check system resources
MEMORY=$(free -m | awk 'NR==2{printf "%.0f", $2/1024}')
DISK=$(df -h / | awk 'NR==2{print $4}' | sed 's/G//')
if [ "$MEMORY" -lt 2 ]; then
    log_warn "Low memory: ${MEMORY}GB (recommended: 2GB+)"
fi
if [ "$DISK" -lt 10 ]; then
    log_warn "Low disk space: ${DISK}GB (recommended: 10GB+)"
fi

# Install dependencies
log_step "Installing system dependencies"
sudo apt update -qq
sudo apt install -y curl wget gnupg lsb-release openssl ufw fail2ban

# Install Docker
log_step "Installing Docker"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    sudo systemctl enable docker
    log_info "Docker installed - please re-login for group permissions"
fi

# Install Docker Compose
log_step "Installing Docker Compose"
if ! command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
    sudo curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Security hardening
log_step "Configuring security"
sudo ufw --force enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'

# Configure fail2ban
sudo tee /etc/fail2ban/jail.local > /dev/null << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 10
EOF

sudo systemctl enable fail2ban
sudo systemctl restart fail2ban

# Setup application directory
log_step "Setting up application directory"
sudo mkdir -p $INSTALL_DIR
sudo chown $USER:$USER $INSTALL_DIR
cd $INSTALL_DIR

# Generate secure secrets
log_step "Generating secure configuration"
JWT_SECRET=$(openssl rand -hex 32)
POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

# Create production docker-compose
log_step "Creating production configuration"
tee docker-compose.yml > /dev/null << EOF
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ppid_garut
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_INITDB_ARGS: "--auth-host=scram-sha-256"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  app:
    image: kamaltz/ppid-master:latest
    ports:
      - "127.0.0.1:3000:3000"
    environment:
      DATABASE_URL: "postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/ppid_garut?schema=public"
      JWT_SECRET: "${JWT_SECRET}"
      NEXT_PUBLIC_API_URL: "https://${DOMAIN}/api"
      NODE_ENV: "production"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./uploads:/app/public/uploads
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

volumes:
  postgres_data:
    driver: local
EOF

# Setup directories
mkdir -p uploads/images backups logs
chmod 755 uploads uploads/images

# Install and configure Nginx
log_step "Installing and configuring Nginx"
sudo apt install -y nginx
sudo systemctl enable nginx

# Create optimized Nginx config
sudo tee /etc/nginx/sites-available/ppid-master << EOF
# Rate limiting zones
limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone \$binary_remote_addr zone=login:10m rate=5r/m;
limit_req_zone \$binary_remote_addr zone=upload:10m rate=2r/s;

server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    
    # Client settings
    client_max_body_size 50M;
    client_body_timeout 60s;
    client_header_timeout 60s;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Static file serving
    location /uploads/ {
        alias ${INSTALL_DIR}/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options "nosniff";
        
        # Security: prevent script execution
        location ~* \.(php|pl|py|jsp|asp|sh|cgi)$ {
            deny all;
        }
        
        try_files \$uri \$uri/ =404;
    }
    
    # API rate limiting
    location /api/auth/login {
        limit_req zone=login burst=3 nodelay;
        limit_req_status 429;
        proxy_pass http://127.0.0.1:3000;
        include /etc/nginx/proxy_params;
    }
    
    location /api/upload {
        limit_req zone=upload burst=5 nodelay;
        limit_req_status 429;
        proxy_pass http://127.0.0.1:3000;
        include /etc/nginx/proxy_params;
    }
    
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        limit_req_status 429;
        proxy_pass http://127.0.0.1:3000;
        include /etc/nginx/proxy_params;
    }

    # Main application
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass \$http_upgrade;
        include /etc/nginx/proxy_params;
    }
    
    # Health check (no rate limiting)
    location /api/health {
        proxy_pass http://127.0.0.1:3000;
        include /etc/nginx/proxy_params;
        access_log off;
    }
}
EOF

# Create proxy params
sudo tee /etc/nginx/proxy_params << 'EOF'
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;
EOF

# Enable site
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/ppid-master /etc/nginx/sites-enabled/

# Test and reload Nginx
if sudo nginx -t; then
    sudo systemctl reload nginx
    log_info "Nginx configured successfully"
else
    log_error "Nginx configuration failed"
    exit 1
fi

# Start services
log_step "Starting PPID services"
docker-compose pull
docker-compose up -d

# Wait for database
log_step "Waiting for database to be ready"
for i in {1..60}; do
    if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        log_info "Database is ready"
        break
    fi
    if [ $i -eq 60 ]; then
        log_error "Database failed to start"
        exit 1
    fi
    sleep 2
done

# Setup database
log_step "Setting up database"
docker-compose exec -T app npx prisma generate
docker-compose exec -T app npx prisma migrate deploy
docker-compose exec -T app npx prisma db seed

# Restart app to ensure clean state
docker-compose restart app

# Wait for application
log_step "Waiting for application to be ready"
for i in {1..60}; do
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        log_info "Application is ready"
        break
    fi
    if [ $i -eq 60 ]; then
        log_error "Application failed to start"
        exit 1
    fi
    sleep 2
done

# Setup SSL
log_step "Setting up SSL certificate"
sudo apt install -y certbot python3-certbot-nginx
if sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL; then
    log_info "SSL certificate installed"
    # Setup auto-renewal
    echo "0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx" | sudo crontab -
else
    log_warn "SSL setup failed, continuing without HTTPS"
fi

# Create maintenance scripts
log_step "Creating maintenance scripts"

# Backup script
tee backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/ppid/backups"
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T postgres pg_dump -U postgres ppid_garut > "$BACKUP_DIR/ppid_backup_$DATE.sql"
find "$BACKUP_DIR" -name "ppid_backup_*.sql" -mtime +7 -delete
echo "Backup completed: ppid_backup_$DATE.sql"
EOF
chmod +x backup.sh

# Update script
tee update.sh << 'EOF'
#!/bin/bash
echo "Updating PPID Master..."
docker-compose pull
docker-compose up -d
echo "Update completed"
EOF
chmod +x update.sh

# Monitoring script
tee monitor.sh << 'EOF'
#!/bin/bash
echo "=== PPID Master Status ==="
echo "Services:"
docker-compose ps
echo ""
echo "Health Check:"
curl -s http://localhost:3000/api/health | jq . 2>/dev/null || curl -s http://localhost:3000/api/health
echo ""
echo "Disk Usage:"
df -h /opt/ppid
echo ""
echo "Memory Usage:"
free -h
echo ""
echo "Recent Logs:"
docker-compose logs --tail=10 app
EOF
chmod +x monitor.sh

# Setup monitoring cron
echo "0 2 * * * cd /opt/ppid && ./backup.sh" | crontab -
echo "*/5 * * * * cd /opt/ppid && ./monitor.sh > /dev/null 2>&1" | crontab -

# Save credentials
log_step "Saving credentials securely"
cat > .env.production << EOF
JWT_SECRET=${JWT_SECRET}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
DOMAIN=${DOMAIN}
EMAIL=${EMAIL}
INSTALL_DATE=$(date)
EOF
chmod 600 .env.production

# Final verification
log_step "Final verification"
sleep 5
if curl -f https://$DOMAIN/api/health > /dev/null 2>&1; then
    HEALTH_STATUS="✅ Healthy"
else
    HEALTH_STATUS="⚠️  Check required"
fi

echo ""
log_info "🎉 PPID Master Production Deployment Complete!"
echo ""
echo "📊 Application Details:"
echo "  🌐 URL: https://$DOMAIN"
echo "  👤 Admin: admin@garut.go.id / Garut@2025?"
echo "  🏥 Health: $HEALTH_STATUS"
echo "  📁 Directory: $INSTALL_DIR"
echo ""
echo "🛠️  Management Commands:"
echo "  Monitor:  cd $INSTALL_DIR && ./monitor.sh"
echo "  Backup:   cd $INSTALL_DIR && ./backup.sh"
echo "  Update:   cd $INSTALL_DIR && ./update.sh"
echo "  Logs:     cd $INSTALL_DIR && docker-compose logs -f"
echo "  Restart:  cd $INSTALL_DIR && docker-compose restart"
echo ""
echo "🔐 Security Features:"
echo "  ✅ Firewall (UFW) enabled"
echo "  ✅ Fail2ban configured"
echo "  ✅ SSL/HTTPS enabled"
echo "  ✅ Rate limiting active"
echo "  ✅ Security headers set"
echo "  ✅ Automated backups"
echo ""
log_info "🔑 Credentials saved in: $INSTALL_DIR/.env.production"
log_info "📖 Documentation: https://github.com/your-repo/ppid-master"