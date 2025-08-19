#!/bin/bash

# Build and Push Docker Image Script
echo "🔨 Building and pushing PPID Master Docker image..."

# Check if DOCKERHUB_USERNAME is set
if [ -z "$DOCKERHUB_USERNAME" ]; then
    echo "❌ DOCKERHUB_USERNAME environment variable is not set"
    echo "   Set it with: export DOCKERHUB_USERNAME=your-username"
    exit 1
fi

# Get version from package.json or use latest
VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "latest")
IMAGE_NAME="$DOCKERHUB_USERNAME/ppid-master"

echo "📦 Building image: $IMAGE_NAME:$VERSION"

# Build the image
docker build -t "$IMAGE_NAME:$VERSION" -t "$IMAGE_NAME:latest" .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed"
    exit 1
fi

echo "✅ Build successful"

# Push to Docker Hub
echo "🚀 Pushing to Docker Hub..."
docker push "$IMAGE_NAME:$VERSION"
docker push "$IMAGE_NAME:latest"

if [ $? -eq 0 ]; then
    echo "✅ Push successful!"
    echo "🌐 Image available at: https://hub.docker.com/r/$DOCKERHUB_USERNAME/ppid-master"
    echo ""
    echo "📋 To deploy:"
    echo "   1. Set DOCKERHUB_USERNAME=$DOCKERHUB_USERNAME in your .env file"
    echo "   2. Run: ./deploy.sh"
else
    echo "❌ Push failed"
    exit 1
fi