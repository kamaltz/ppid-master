#!/bin/bash
set -e

cd /opt/ppid

# Update docker-compose to disable Next.js image optimization
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
      NEXT_IMAGES_UNOPTIMIZED: "true"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - /opt/ppid/uploads:/app/public/uploads
    restart: unless-stopped

volumes:
  postgres_data:
EOF

# Restart app with new config
sudo docker-compose up -d

echo "✅ Image optimization disabled - images will load directly"