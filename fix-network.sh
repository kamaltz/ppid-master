#!/bin/bash
set -e

echo "🔧 Fixing network connectivity..."

cd /opt/ppid

# Stop all services
sudo docker-compose down
sudo docker-compose -f /opt/caddy-compose.yml down

# Remove and recreate network
sudo docker network rm proxy 2>/dev/null || true
sudo docker network create proxy

# Update docker-compose to include default network
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
    networks:
      - default
      - proxy

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
      - default
      - proxy

volumes:
  postgres_data:

networks:
  proxy:
    external: true
EOF

# Start services
echo "Starting services..."
sudo docker-compose up -d
sleep 30

# Start Caddy
sudo docker-compose -f /opt/caddy-compose.yml up -d

# Setup database
echo "Setting up database..."
sudo docker-compose exec -T app npx prisma generate
sudo docker-compose exec -T app npx prisma db push --force-reset --accept-data-loss
sudo docker-compose exec -T app npx prisma db seed

echo "✅ Network fixed!"