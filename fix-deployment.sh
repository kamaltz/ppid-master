#!/bin/bash
set -e

echo "🔧 PPID Master - Deployment Fix Script"

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.deploy.yml down -v 2>/dev/null || true

# Remove old images
echo "🗑️ Cleaning up old images..."
docker rmi $(docker images "*ppid-master*" -q) 2>/dev/null || true

# Create environment file with proper values
echo "📝 Creating environment configuration..."
cat > .env << 'EOF'
DOCKERHUB_USERNAME=your-dockerhub-username
POSTGRES_PASSWORD=postgres123
JWT_SECRET=ppid-garut-production-secret-2025
NEXT_PUBLIC_API_URL=http://localhost:3000/api
EOF

# Create uploads directory with proper permissions
echo "📁 Creating uploads directory..."
mkdir -p uploads
chmod 755 uploads

# Pull latest images and start services
echo "🚀 Starting deployment..."
docker-compose -f docker-compose.deploy.yml pull
docker-compose -f docker-compose.deploy.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check health
echo "🏥 Checking application health..."
for i in {1..10}; do
  if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
    echo "✅ Application is healthy!"
    break
  else
    echo "⏳ Waiting for application... ($i/10)"
    sleep 10
  fi
done

# Show status
echo "📊 Deployment Status:"
docker-compose -f docker-compose.deploy.yml ps

echo ""
echo "✅ Deployment complete!"
echo "🌐 URL: http://localhost:3000"
echo "👤 Admin: admin@garut.go.id / Garut@2025?"
echo ""
echo "📋 Useful commands:"
echo "  View logs: docker-compose -f docker-compose.deploy.yml logs -f"
echo "  Stop: docker-compose -f docker-compose.deploy.yml down"
echo "  Restart: docker-compose -f docker-compose.deploy.yml restart"