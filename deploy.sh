#!/bin/bash
set -e

echo "🚀 PPID Master - Docker Hub Deployment"

# Create environment file
cat > .env << 'EOF'
DOCKERHUB_USERNAME=your-dockerhub-username
POSTGRES_PASSWORD=postgres123
JWT_SECRET=ppid-garut-production-secret-2025
NEXT_PUBLIC_API_URL=http://167.172.83.55/api
EOF

# Create uploads directory
mkdir -p uploads

# Pull and start services
docker-compose -f docker-compose.deploy.yml pull
docker-compose -f docker-compose.deploy.yml up -d

echo "✅ Deployment complete!"
echo "🌐 URL: http://167.172.83.55"
echo "👤 Admin: admin@garutkab.go.id / Garut@2025?"