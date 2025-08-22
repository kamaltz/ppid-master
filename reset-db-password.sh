#!/bin/bash

echo "🔐 Resetting PostgreSQL password..."

# Generate new password
NEW_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

# Stop containers
docker-compose -f docker-compose.deploy.yml down

# Remove postgres volume
docker volume rm ppid-master_postgres_data 2>/dev/null || true

# Update environment
export POSTGRES_PASSWORD=$NEW_PASSWORD
export JWT_SECRET=${JWT_SECRET:-ppid-garut-jwt-secret-2025}

# Start with new password
docker-compose -f docker-compose.deploy.yml up -d

echo "✅ Password reset complete!"
echo "New PostgreSQL password: $NEW_PASSWORD"
echo ""
echo "Updated DATABASE_URL:"
echo "postgresql://postgres:$NEW_PASSWORD@postgres:5432/ppid_garut?schema=public"