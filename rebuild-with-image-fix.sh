#!/bin/bash
set -e

echo "🔧 Rebuilding with image fix..."

# Trigger CI/CD to rebuild with new next.config.ts
cd /opt/ppid

# For now, update docker-compose to use unoptimized images
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

# Update Nginx to serve images directly without Next.js processing
sudo tee /etc/nginx/sites-available/ppid-master << 'EOF'
server {
    listen 80;
    server_name _;
    client_max_body_size 50M;

    # Serve images directly, bypass Next.js
    location /uploads/ {
        alias /opt/ppid/uploads/;
        expires 1y;
        add_header Cache-Control "public";
        try_files $uri $uri/ =404;
    }

    # Block Next.js image optimization
    location /_next/image {
        return 404;
    }

    # Proxy everything else
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

sudo nginx -t && sudo systemctl reload nginx

# Restart app
sudo docker-compose pull
sudo docker-compose up -d

echo "✅ Image serving fixed - images will load directly from /uploads/"
echo "📝 Note: Push code changes to trigger new Docker build with image optimization disabled"