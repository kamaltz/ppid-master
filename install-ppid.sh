#!/bin/bash
set -e

# Colors for better UI
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Clear screen and show header
clear
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    PPID Master Installer                     ║${NC}"
echo -e "${CYAN}║                  Production Deployment                       ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Fixed configuration
DOMAIN="ppidgarut.kamaltz.fun"
PROXY_CHOICE="caddy"

echo -e "${CYAN}Configuration:${NC}"
echo "────────────────────────────────────────"
echo -e "${YELLOW}Domain:${NC} $DOMAIN"
echo -e "${YELLOW}SSL:${NC} Automatic HTTPS (Let's Encrypt)"
echo -e "${YELLOW}Proxy:${NC} Caddy (Auto SSL)"
echo ""

# Function to get yes/no input
get_yes_no() {
    local prompt="$1"
    local choice
    
    while true; do
        echo -ne "${GREEN}$prompt (y/n): ${NC}"
        read choice
        
        case "$choice" in
            [Yy]|[Yy][Ee][Ss]) echo "y"; return ;;
            [Nn]|[Nn][Oo]) echo "n"; return ;;
            *) echo -e "${RED}✗ Please enter 'y' for yes or 'n' for no${NC}" ;;
        esac
    done
}

CONFIRM=$(get_yes_no "Proceed with installation?")

if [ "$CONFIRM" = "n" ]; then
    echo -e "${RED}Installation cancelled by user.${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}🚀 Starting installation...${NC}"
echo ""

# Install Docker
echo -e "${BLUE}Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    echo -e "${GREEN}✓ Docker installed${NC}"
else
    echo -e "${GREEN}✓ Docker already installed${NC}"
fi

# Install Docker Compose
echo -e "${BLUE}Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✓ Docker Compose installed${NC}"
else
    echo -e "${GREEN}✓ Docker Compose already installed${NC}"
fi

# Create app directory
echo -e "${BLUE}Setting up application directory...${NC}"
sudo mkdir -p /opt/ppid
cd /opt/ppid

# Create proxy network
docker network create proxy 2>/dev/null || true

# Create docker-compose.yml for PPID app
echo -e "${BLUE}Creating Docker configuration...${NC}"
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

# Setup uploads directory
echo -e "${BLUE}Setting up file storage...${NC}"
sudo mkdir -p /opt/ppid/uploads/images
sudo chown -R 1001:1001 /opt/ppid/uploads
sudo chmod -R 755 /opt/ppid/uploads

# Setup Caddy
echo -e "${BLUE}Setting up Caddy proxy...${NC}"
sudo mkdir -p /opt/caddy

# Create Caddyfile
sudo tee /opt/caddy/Caddyfile > /dev/null << EOF
$DOMAIN {
    reverse_proxy ppid-app-1:3000
    
    # Handle uploads directly
    handle_path /uploads/* {
        root * /opt/ppid/uploads
        file_server
    }
    
    # Security headers
    header {
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        X-XSS-Protection "1; mode=block"
        Referrer-Policy strict-origin-when-cross-origin
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

# Start Caddy first
echo -e "${BLUE}Starting Caddy proxy...${NC}"
sudo docker-compose -f /opt/caddy-compose.yml up -d

# Start PPID application
echo -e "${BLUE}Starting PPID Master application...${NC}"
sudo docker-compose pull
sudo docker-compose up -d

echo -e "${BLUE}Waiting for services to start...${NC}"
sleep 45

# Setup database
echo -e "${BLUE}Setting up database...${NC}"
sudo docker-compose exec -T app npx prisma generate
sudo docker-compose exec -T app npx prisma db push --force-reset --accept-data-loss
sudo docker-compose exec -T app npx prisma db seed
sudo docker-compose restart app
sleep 15

# Configure firewall
echo -e "${BLUE}Configuring firewall...${NC}"
sudo ufw allow 22 >/dev/null 2>&1
sudo ufw allow 80 >/dev/null 2>&1
sudo ufw allow 443 >/dev/null 2>&1
echo "y" | sudo ufw enable >/dev/null 2>&1 || true

# Installation complete
clear
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                  Installation Complete!                     ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${CYAN}🌐 Application URL:${NC} https://$DOMAIN"
echo -e "${CYAN}🔒 SSL Certificate:${NC} Automatic (Let's Encrypt)"
echo ""
echo -e "${CYAN}📊 Default Admin Account:${NC}"
echo -e "${YELLOW}   Email:${NC} admin@garut.go.id"
echo -e "${YELLOW}   Password:${NC} Garut@2025?"
echo ""
echo -e "${CYAN}📋 Management Commands:${NC}"
echo -e "${YELLOW}   View logs:${NC} sudo docker-compose -f /opt/ppid/docker-compose.yml logs -f"
echo -e "${YELLOW}   Restart:${NC} sudo docker-compose -f /opt/ppid/docker-compose.yml restart"
echo -e "${YELLOW}   Update:${NC} sudo docker-compose -f /opt/ppid/docker-compose.yml pull && sudo docker-compose -f /opt/ppid/docker-compose.yml up -d"
echo ""
echo -e "${GREEN}✅ PPID Master is now running at https://$DOMAIN${NC}"