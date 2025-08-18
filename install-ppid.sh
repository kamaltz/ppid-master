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

# Function to show menu and get selection
show_menu() {
    local title="$1"
    shift
    local options=("$@")
    
    echo -e "${BLUE}$title${NC}"
    echo "────────────────────────────────────────"
    
    for i in "${!options[@]}"; do
        echo -e "${YELLOW}$((i+1)).${NC} ${options[$i]}"
    done
    echo ""
}

# Function to get valid input
get_input() {
    local prompt="$1"
    local max="$2"
    local choice
    
    while true; do
        echo -ne "${GREEN}$prompt${NC}"
        read choice
        
        if [[ "$choice" =~ ^[1-9][0-9]*$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le "$max" ]; then
            echo "$choice"
            return
        else
            echo -e "${RED}✗ Invalid input. Please enter a number between 1 and $max${NC}"
        fi
    done
}

# Function to get domain input
get_domain() {
    local domain
    while true; do
        echo -ne "${GREEN}Enter your domain name (e.g., example.com): ${NC}"
        read domain
        
        if [[ "$domain" =~ ^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$ ]]; then
            echo "$domain"
            return
        else
            echo -e "${RED}✗ Invalid domain format. Please enter a valid domain (e.g., example.com)${NC}"
        fi
    done
}

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

# Step 1: Domain Configuration
echo -e "${CYAN}Step 1: Domain Configuration${NC}"
echo ""
domain_options=(
    "Use server IP address (no domain required)"
    "Use custom domain name"
)

show_menu "How do you want to access your application?" "${domain_options[@]}"
DOMAIN_CHOICE=$(get_input "Select option: " 2)

if [ "$DOMAIN_CHOICE" = "2" ]; then
    echo ""
    DOMAIN=$(get_domain)
    echo ""
    SSL_CHOICE=$(get_yes_no "Do you want to setup SSL certificate for $DOMAIN?")
else
    DOMAIN="ip"
    SSL_CHOICE="n"
fi

echo ""

# Step 2: Proxy Manager Selection
echo -e "${CYAN}Step 2: Proxy Manager Selection${NC}"
echo ""
proxy_options=(
    "Nginx (Built-in) - Simple and reliable"
    "Nginx Proxy Manager - Web UI for easy management"
    "Traefik - Advanced with automatic SSL"
    "Caddy - Modern with automatic HTTPS"
)

show_menu "Choose your reverse proxy manager:" "${proxy_options[@]}"
PROXY_CHOICE=$(get_input "Select option: " 4)

echo ""

# Step 3: Configuration Summary
echo -e "${CYAN}Step 3: Configuration Summary${NC}"
echo "────────────────────────────────────────"

if [ "$DOMAIN" = "ip" ]; then
    echo -e "${YELLOW}Domain:${NC} Server IP address"
else
    echo -e "${YELLOW}Domain:${NC} $DOMAIN"
    if [ "$SSL_CHOICE" = "y" ]; then
        echo -e "${YELLOW}SSL:${NC} Yes (Let's Encrypt)"
    else
        echo -e "${YELLOW}SSL:${NC} No"
    fi
fi

case $PROXY_CHOICE in
    1) echo -e "${YELLOW}Proxy:${NC} Nginx (Built-in)" ;;
    2) echo -e "${YELLOW}Proxy:${NC} Nginx Proxy Manager" ;;
    3) echo -e "${YELLOW}Proxy:${NC} Traefik" ;;
    4) echo -e "${YELLOW}Proxy:${NC} Caddy" ;;
esac

echo ""
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

# Create docker-compose.yml
echo -e "${BLUE}Creating Docker configuration...${NC}"
if [ "$PROXY_CHOICE" = "1" ]; then
    # Built-in Nginx
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
else
    # External proxy managers
    docker network create proxy 2>/dev/null || true
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
      NEXT_PUBLIC_API_URL: "http://localhost:3000/api"
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
fi

# Setup uploads directory
echo -e "${BLUE}Setting up file storage...${NC}"
sudo mkdir -p /opt/ppid/uploads/images
sudo chown -R 1001:1001 /opt/ppid/uploads
sudo chmod -R 755 /opt/ppid/uploads

# Setup proxy manager
echo -e "${BLUE}Setting up proxy manager...${NC}"
case $PROXY_CHOICE in
    1)
        # Built-in Nginx
        sudo apt update -qq
        sudo apt install -y nginx
        
        if [ "$DOMAIN" = "ip" ]; then
            SERVER_NAME="_"
        else
            SERVER_NAME="$DOMAIN www.$DOMAIN"
        fi
        
        sudo tee /etc/nginx/sites-available/ppid-master << EOF
server {
    listen 80;
    server_name $SERVER_NAME;
    client_max_body_size 50M;

    location /uploads/ {
        alias /opt/ppid/uploads/;
        expires 1y;
        add_header Cache-Control "public";
        try_files \$uri \$uri/ =404;
    }

    location /_next/image {
        return 404;
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
        ;;
    2)
        # Nginx Proxy Manager
        sudo tee /opt/nginx-proxy-manager.yml > /dev/null << 'EOF'
services:
  nginx-proxy-manager:
    image: jc21/nginx-proxy-manager:latest
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "81:81"
    volumes:
      - npm_data:/data
      - npm_letsencrypt:/etc/letsencrypt
    networks:
      - proxy

volumes:
  npm_data:
  npm_letsencrypt:

networks:
  proxy:
    external: true
EOF
        sudo docker-compose -f /opt/nginx-proxy-manager.yml up -d
        ;;
    3)
        # Traefik
        sudo mkdir -p /opt/traefik
        sudo tee /opt/traefik/traefik.yml > /dev/null << 'EOF'
api:
  dashboard: true
  insecure: true

entryPoints:
  web:
    address: ":80"
  websecure:
    address: ":443"

providers:
  docker:
    exposedByDefault: false

certificateResolvers:
  letsencrypt:
    acme:
      email: admin@example.com
      storage: /acme.json
      httpChallenge:
        entryPoint: web
EOF
        
        sudo tee /opt/traefik-compose.yml > /dev/null << 'EOF'
services:
  traefik:
    image: traefik:v3.0
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - /opt/traefik/traefik.yml:/traefik.yml:ro
      - traefik_acme:/acme.json
    networks:
      - proxy

volumes:
  traefik_acme:

networks:
  proxy:
    external: true
EOF
        sudo docker-compose -f /opt/traefik-compose.yml up -d
        ;;
    4)
        # Caddy
        sudo mkdir -p /opt/caddy
        if [ "$DOMAIN" = "ip" ]; then
            echo ":80 {
    reverse_proxy ppid-app-1:3000
}" | sudo tee /opt/caddy/Caddyfile > /dev/null
        else
            echo "$DOMAIN {
    reverse_proxy ppid-app-1:3000
}" | sudo tee /opt/caddy/Caddyfile > /dev/null
        fi
        
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
        sudo docker-compose -f /opt/caddy-compose.yml up -d
        ;;
esac

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

# Setup SSL for built-in Nginx
if [ "$PROXY_CHOICE" = "1" ] && [ "$SSL_CHOICE" = "y" ]; then
    echo -e "${BLUE}Setting up SSL certificate...${NC}"
    sudo apt install -y certbot python3-certbot-nginx
    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
fi

# Configure firewall
echo -e "${BLUE}Configuring firewall...${NC}"
sudo ufw allow 22 >/dev/null 2>&1
sudo ufw allow 80 >/dev/null 2>&1
sudo ufw allow 443 >/dev/null 2>&1

case $PROXY_CHOICE in
    2) sudo ufw allow 81 >/dev/null 2>&1 ;;
    3) sudo ufw allow 8080 >/dev/null 2>&1 ;;
esac

echo "y" | sudo ufw enable >/dev/null 2>&1 || true

# Get public IP
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "YOUR_SERVER_IP")

# Installation complete
clear
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                  Installation Complete!                     ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

case $PROXY_CHOICE in
    1)
        if [ "$DOMAIN" = "ip" ]; then
            echo -e "${CYAN}🌐 Application URL:${NC} http://$PUBLIC_IP"
        else
            if [ "$SSL_CHOICE" = "y" ]; then
                echo -e "${CYAN}🌐 Application URL:${NC} https://$DOMAIN"
            else
                echo -e "${CYAN}🌐 Application URL:${NC} http://$DOMAIN"
            fi
        fi
        ;;
    2)
        echo -e "${CYAN}🌐 Nginx Proxy Manager:${NC} http://$PUBLIC_IP:81"
        echo -e "${YELLOW}📝 Default Login:${NC} admin@example.com / changeme"
        echo -e "${YELLOW}📝 Configure proxy host:${NC} ppid-app-1:3000"
        ;;
    3)
        echo -e "${CYAN}🌐 Traefik Dashboard:${NC} http://$PUBLIC_IP:8080"
        echo -e "${YELLOW}📝 Add labels to docker-compose.yml for routing${NC}"
        ;;
    4)
        echo -e "${CYAN}🌐 Application:${NC} Configured via Caddyfile"
        if [ "$DOMAIN" != "ip" ]; then
            echo -e "${CYAN}🌐 URL:${NC} https://$DOMAIN (auto SSL)"
        fi
        ;;
esac

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
echo -e "${GREEN}✅ PPID Master is now running!${NC}"