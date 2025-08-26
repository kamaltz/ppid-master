#!/bin/bash

# Quick PPID Master Update (No Backup)
# For development/testing - updates container without backup

set -e

echo "⚡ Quick update starting..."

# Detect docker compose command
if command -v "docker compose" &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    echo "❌ Docker Compose not found. Please install Docker Compose."
    exit 1
fi

echo "📦 Pulling latest image..."
$DOCKER_COMPOSE -f docker-compose.deploy.yml pull app

echo "🔄 Recreating container..."
$DOCKER_COMPOSE -f docker-compose.deploy.yml up -d --force-recreate app

echo "⏳ Waiting for startup..."
sleep 5

echo "✅ Quick update completed!"
$DOCKER_COMPOSE -f docker-compose.deploy.yml ps