#!/bin/bash

# PPID Master Deployment Script
echo "🚀 Starting PPID Master deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before continuing"
    echo "   Required variables:"
    echo "   - DOCKERHUB_USERNAME: Your Docker Hub username"
    echo "   - POSTGRES_PASSWORD: Database password"
    echo "   - JWT_SECRET: JWT secret key"
    exit 1
fi

# Load environment variables
source .env

# Check required variables
if [ -z "$DOCKERHUB_USERNAME" ]; then
    echo "❌ DOCKERHUB_USERNAME is not set in .env file"
    exit 1
fi

echo "📦 Pulling latest Docker image..."
docker-compose -f docker-compose.deploy.yml pull

echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.deploy.yml down

echo "🗂️ Creating uploads directory..."
mkdir -p uploads/images

echo "🚀 Starting services..."
docker-compose -f docker-compose.deploy.yml up -d

echo "⏳ Waiting for services to be ready..."
sleep 30

# Check if services are running
if docker-compose -f docker-compose.deploy.yml ps | grep -q "Up"; then
    echo "✅ Deployment successful!"
    echo "🌐 Application is running at: http://localhost:3000"
    echo "📊 Health check: http://localhost:3000/api/health"
    echo ""
    echo "📋 Default accounts:"
    echo "   Admin: admin@garut.go.id / Garut@2025?"
    echo "   PPID Utama: ppid.utama@garut.go.id / Garut@2025?"
    echo "   PPID Pelaksana: ppid.pelaksana@garut.go.id / Garut@2025?"
    echo "   Pemohon: pemohon@example.com / Garut@2025?"
else
    echo "❌ Deployment failed. Check logs with:"
    echo "   docker-compose -f docker-compose.deploy.yml logs"
    exit 1
fi