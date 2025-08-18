#!/bin/bash
set -e

echo "🚀 PPID Master - Production Deployment"
echo "========================================"
echo ""
echo "Please configure your deployment:"
echo ""

# Get domain configuration
echo "📍 DOMAIN CONFIGURATION:"
echo "1. Use IP address only (no domain needed)"
echo "2. Use custom domain"
echo ""
while true; do
    read -p "Choose option (1-2): " DOMAIN_CHOICE
    if [ "$DOMAIN_CHOICE" = "1" ] || [ "$DOMAIN_CHOICE" = "2" ]; then
        break
    fi
    echo "Please enter 1 or 2"
done

if [ "$DOMAIN_CHOICE" = "2" ]; then
    while true; do
        read -p "Enter your domain (e.g., example.com): " DOMAIN
        if [ -n "$DOMAIN" ]; then
            break
        fi
        echo "Domain cannot be empty"
    done
    
    while true; do
        read -p "Setup SSL certificate for $DOMAIN? (y/n): " SSL_CHOICE
        if [ "$SSL_CHOICE" = "y" ] || [ "$SSL_CHOICE" = "n" ]; then
            break
        fi
        echo "Please enter y or n"
    done
else
    DOMAIN="_"
    SSL_CHOICE="n"
fi

echo ""
# Get proxy manager choice
echo "🔧 PROXY MANAGER:"
echo "1. Nginx (built-in, recommended for beginners)"
echo "2. Nginx Proxy Manager (web UI management)"
echo "3. Traefik (advanced, auto SSL)"
echo "4. Caddy (simple, auto SSL)"
echo ""
while true; do
    read -p "Choose proxy manager (1-4): " PROXY_CHOICE
    if [ "$PROXY_CHOICE" -ge 1 ] && [ "$PROXY_CHOICE" -le 4 ] 2>/dev/null; then
        break
    fi
    echo "Please enter a number between 1-4"
done

echo ""
echo "📋 CONFIGURATION SUMMARY:"
if [ "$DOMAIN" = "_" ]; then
    echo "   Domain: IP address only"
else
    echo "   Domain: $DOMAIN"
    echo "   SSL: $SSL_CHOICE"
fi
case $PROXY_CHOICE in
    1) echo "   Proxy: Nginx (built-in)" ;;
    2) echo "   Proxy: Nginx Proxy Manager" ;;
    3) echo "   Proxy: Traefik" ;;
    4) echo "   Proxy: Caddy" ;;
esac
echo ""
read -p "Continue with installation? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
    echo "Installation cancelled."
    exit 0
fi

echo ""
echo "🚀 Starting installation..."
echo ""

# Install Docker
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Create app directory
sudo mkdir -p /opt/ppid
cd /opt/ppid

# Create docker-compose.yml based on proxy choice
if [ "$PROXY_CHOICE" = "1" ]; then
    # Nginx built-in
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
      - "3000:3000"
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

# Create uploads directory
sudo mkdir -p /opt/ppid/uploads/images
sudo chown -R 1001:1001 /opt/ppid/uploads
sudo chmod -R 755 /opt/ppid/uploads

# Setup proxy manager
if [ "$PROXY_CHOICE" = "1" ]; then
    # Built-in Nginx
    echo "Setting up Nginx..."
    sudo apt update
    sudo apt install -y nginx
    
    if [ "$DOMAIN" = "_" ]; then
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
    
elif [ "$PROXY_CHOICE" = "2" ]; then
    # Nginx Proxy Manager
    echo "Setting up Nginx Proxy Manager..."
    docker network create proxy 2>/dev/null || true
    
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
    
elif [ "$PROXY_CHOICE" = "3" ]; then
    # Traefik
    echo "Setting up Traefik..."
    docker network create proxy 2>/dev/null || true
    
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
    
else
    # Caddy
    echo "Setting up Caddy..."
    docker network create proxy 2>/dev/null || true
    
    sudo mkdir -p /opt/caddy
    if [ "$DOMAIN" = "_" ]; then
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
fi

# Start PPID services
echo "Starting PPID Master..."
sudo docker-compose pull
sudo docker-compose up -d
sleep 45

# Setup database
echo "Setting up database..."
sudo docker-compose exec -T app npx prisma generate
sudo docker-compose exec -T app npx prisma db push --force-reset --accept-data-loss
sudo docker-compose exec -T app npx prisma db seed
sudo docker-compose restart app
sleep 15

# Setup SSL for built-in Nginx
if [ "$PROXY_CHOICE" = "1" ] && [ "$SSL_CHOICE" = "y" ]; then
    sudo apt install -y certbot python3-certbot-nginx
    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
fi

# Configure firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
if [ "$PROXY_CHOICE" = "2" ]; then
    sudo ufw allow 81
elif [ "$PROXY_CHOICE" = "3" ]; then
    sudo ufw allow 8080
fi
echo "y" | sudo ufw enable 2>/dev/null || true

PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "YOUR_IP")

echo ""
echo "✅ Installation Complete!"
if [ "$PROXY_CHOICE" = "1" ]; then
    if [ "$DOMAIN" = "_" ]; then
        echo "🌐 Access: http://$PUBLIC_IP"
    else
        if [ "$SSL_CHOICE" = "y" ]; then
            echo "🌐 Access: https://$DOMAIN"
        else
            echo "🌐 Access: http://$DOMAIN"
        fi
    fi
elif [ "$PROXY_CHOICE" = "2" ]; then
    echo "🌐 App: Configure at http://$PUBLIC_IP:81"
    echo "📝 NPM Login: admin@example.com / changeme"
elif [ "$PROXY_CHOICE" = "3" ]; then
    echo "🌐 App: Configure at http://$PUBLIC_IP:8080"
    echo "📝 Add labels to docker-compose.yml for routing"
else
    echo "🌐 App: Configure Caddyfile for your domain"
fi
echo ""
echo "📊 Admin: admin@garut.go.id / Garut@2025?"
echo ""
echo "Management:"
echo "  sudo docker-compose -f /opt/ppid/docker-compose.yml logs -f"
echo "  sudo docker-compose -f /opt/ppid/docker-compose.yml restart"