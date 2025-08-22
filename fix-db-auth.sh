#!/bin/bash

echo "🔧 Fixing PostgreSQL authentication..."

# Stop containers
docker-compose -f docker-compose.deploy.yml down

# Remove postgres volume to reset password
docker volume rm ppid-master_postgres_data

# Get current password from environment or generate new one
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)}

# Update docker-compose with correct password
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
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d ppid_garut"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    image: kamaltz/ppid-master:latest
    ports:
      - "127.0.0.1:3000:3000"
    environment:
      DATABASE_URL: "postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/ppid_garut?schema=public"
      JWT_SECRET: "${JWT_SECRET:-ppid-garut-jwt-secret-2025}"
      NEXT_PUBLIC_API_URL: "https://ppid.garutkab.go.id/api"
      DOCKER_ENV: "true"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - /opt/ppid/uploads:/app/uploads
    restart: unless-stopped

volumes:
  postgres_data:
EOF

# Start postgres first
echo "Starting PostgreSQL with new password..."
docker-compose up -d postgres

# Wait for postgres
echo "Waiting for PostgreSQL..."
sleep 30

# Test connection
echo "Testing connection..."
docker-compose exec postgres pg_isready -U postgres -d ppid_garut

# Start app
echo "Starting application..."
docker-compose up -d app

echo "✅ Database authentication fixed!"
echo "New password: ${POSTGRES_PASSWORD}"
echo "Save this password: ${POSTGRES_PASSWORD}"