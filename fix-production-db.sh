#!/bin/bash

echo "🔧 Fixing production database authentication..."

# Stop all containers
docker-compose -f docker-compose.deploy.yml down

# Remove postgres volume to reset
docker volume rm ppid-master_postgres_data 2>/dev/null || true

# Generate new password
NEW_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

# Create .env file with new password
cat > .env << EOF
POSTGRES_PASSWORD=${NEW_PASSWORD}
JWT_SECRET=ppid-garut-jwt-secret-2025
DOCKERHUB_USERNAME=kamaltz
NEXT_PUBLIC_API_URL=https://ppid.garutkab.go.id/api
EOF

echo "Starting with new password: ${NEW_PASSWORD}"

# Start containers with new environment
docker-compose -f docker-compose.deploy.yml up -d

echo "✅ Database reset complete!"
echo "Password saved in .env file"