#!/bin/bash
set -e

echo "🔧 Switching to Nginx (more reliable)..."

cd /opt/ppid

# Stop Caddy
sudo docker-compose -f /opt/caddy-compose.yml down 2>/dev/null || true

# Install Nginx
sudo apt update
sudo apt install -y nginx

# Create Nginx config
sudo tee /etc/nginx/sites-available/ppid << 'EOF'
server {
    listen 80;
    server_name ppidgarut.kamaltz.fun;
    client_max_body_size 50M;

    location /uploads/ {
        alias /opt/ppid/uploads/;
        expires 1y;
        add_header Cache-Control "public";
        try_files $uri $uri/ =404;
    }

    location /_next/image {
        return 404;
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
    }
}
EOF

# Enable site
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/ppid /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Update docker-compose to expose port
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
      NEXT_PUBLIC_API_URL: "https://ppidgarut.kamaltz.fun/api"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - /opt/ppid/uploads:/app/public/uploads
    restart: unless-stopped

volumes:
  postgres_data:
EOF

# Restart app
sudo docker-compose up -d

# Setup SSL
echo "Setting up SSL..."
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d ppidgarut.kamaltz.fun --non-interactive --agree-tos --email admin@kamaltz.fun

echo "✅ Switched to Nginx with SSL!"
echo "🌐 Test: https://ppidgarut.kamaltz.fun"