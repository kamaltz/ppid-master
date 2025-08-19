#!/bin/bash
set -euo pipefail

# PPID Master - Production Deploy with Database Migration
# Usage: curl -fsSL https://raw.githubusercontent.com/your-repo/ppid-master/main/deploy-with-migration.sh | bash -s -- domain.com admin@domain.com

DOMAIN=${1:-"ppidgarut.kamaltz.fun"}
EMAIL=${2:-"admin@kamaltz.fun"}
REPO_URL="https://raw.githubusercontent.com/your-repo/ppid-master/main"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

log_info "🚀 PPID Master - Production Deployment with Migration"
log_info "Domain: $DOMAIN"
log_info "Email: $EMAIL"

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   log_error "Do not run as root"
   exit 1
fi

# Install dependencies
log_info "Installing dependencies..."
sudo apt update -qq
sudo apt install -y curl wget docker.io docker-compose nginx certbot python3-certbot-nginx ufw fail2ban openssl

# Setup Docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Setup directories
INSTALL_DIR="/opt/ppid"
sudo mkdir -p $INSTALL_DIR
sudo chown $USER:$USER $INSTALL_DIR
cd $INSTALL_DIR

# Generate secrets
JWT_SECRET=$(openssl rand -hex 32)
POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

# Download and create docker-compose
log_info "Creating configuration..."
cat > docker-compose.yml << EOF
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ppid_garut
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
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
      NEXT_PUBLIC_API_URL: "https://${DOMAIN}/api"
      NODE_ENV: "production"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./uploads:/app/public/uploads
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
EOF

# Setup directories
mkdir -p uploads/images backups

# Configure firewall
log_info "Configuring security..."
sudo ufw --force enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Configure Nginx
sudo tee /etc/nginx/sites-available/ppid-master << EOF
limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone \$binary_remote_addr zone=login:10m rate=5r/m;

server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    client_max_body_size 50M;
    
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location /uploads/ {
        alias ${INSTALL_DIR}/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /api/auth/login {
        limit_req zone=login burst=3 nodelay;
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
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

sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/ppid-master /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Start services
log_info "Starting services..."
docker-compose pull
docker-compose up -d

# Wait for database
log_info "Waiting for database..."
for i in {1..60}; do
    if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        break
    fi
    if [ $i -eq 60 ]; then
        log_error "Database failed to start"
        exit 1
    fi
    sleep 2
done

# Setup database
log_info "Setting up database..."
docker-compose exec -T app npx prisma generate
docker-compose exec -T app npx prisma migrate deploy
docker-compose exec -T app npx prisma db seed
docker-compose restart app

# Wait for app
log_info "Waiting for application..."
for i in {1..60}; do
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        break
    fi
    if [ $i -eq 60 ]; then
        log_error "Application failed to start"
        exit 1
    fi
    sleep 2
done

# Setup SSL
log_info "Setting up SSL..."
if sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL; then
    echo "0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx" | sudo crontab -
fi

# Download migration scripts
log_info "Setting up migration tools..."
curl -fsSL $REPO_URL/import-database.sh > import-database.sh
chmod +x import-database.sh

# Create management scripts
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T postgres pg_dump -U postgres ppid_garut > "backups/backup_$DATE.sql"
find backups/ -name "backup_*.sql" -mtime +7 -delete
echo "Backup created: backup_$DATE.sql"
EOF

cat > update.sh << 'EOF'
#!/bin/bash
docker-compose pull
docker-compose up -d
echo "Update completed"
EOF

chmod +x backup.sh update.sh

# Save credentials
cat > .env.production << EOF
JWT_SECRET=${JWT_SECRET}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
DOMAIN=${DOMAIN}
EMAIL=${EMAIL}
INSTALL_DATE=$(date)
EOF
chmod 600 .env.production

echo ""
log_info "✅ PPID Master deployed successfully!"
echo ""
echo "🌐 URL: https://$DOMAIN"
echo "👤 Admin: admin@garut.go.id / Garut@2025?"
echo "📁 Directory: $INSTALL_DIR"
echo ""
echo "📥 To import your database:"
echo "1. Copy your database-export/ folder to $INSTALL_DIR/"
echo "2. Run: ./import-database.sh"
echo ""
echo "🛠️ Management:"
echo "  Backup: ./backup.sh"
echo "  Update: ./update.sh"
echo "  Logs: docker-compose logs -f"
echo ""
log_info "🔑 Credentials saved in: $INSTALL_DIR/.env.production"