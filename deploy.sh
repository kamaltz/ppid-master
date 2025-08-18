#!/bin/bash

echo "🚀 Deploying PPID Master Application..."

# Create uploads directory
mkdir -p uploads

# Set default environment if not exists
if [ ! -f .env ]; then
  echo "📝 Creating default .env file..."
  cat > .env << 'EOF'
DOCKERHUB_USERNAME=your-dockerhub-username
POSTGRES_PASSWORD=postgres123
JWT_SECRET=ppid-garut-jwt-secret-2025-change-in-production
NEXT_PUBLIC_API_URL=http://localhost:3000/api
EOF
  echo "⚠️  Please edit .env file with your Docker Hub username and secure passwords"
fi

# Pull latest images
echo "📦 Pulling latest images..."
docker-compose -f docker-compose.deploy.yml pull

# Start services
echo "🔄 Starting services..."
docker-compose -f docker-compose.deploy.yml up -d

echo "✅ Deployment complete!"
echo "🌐 Application available at: http://localhost:3000"
echo "📊 Default admin login: admin@garut.go.id / Garut@2025?"
echo ""
echo "📋 Available accounts after seeding:"
echo "   Admin: admin@garut.go.id"
echo "   PPID Utama: ppid.utama@garut.go.id"
echo "   PPID Pelaksana: ppid.pelaksana@garut.go.id"
echo "   Atasan PPID: atasan.ppid@garut.go.id"
echo "   Pemohon Test: pemohon@example.com"
echo "   Password for all: Garut@2025?"