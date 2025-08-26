#!/bin/bash

# Check Database Configuration Script

echo "🔍 Checking database configuration..."

echo "📊 Database container status:"
docker ps --filter name=postgres

echo "🔑 Database environment variables:"
docker exec ppid-postgres-1 printenv | grep POSTGRES || echo "No POSTGRES env vars found"

echo "🗄️ Database connection test:"
docker exec ppid-postgres-1 psql -U postgres -d ppid_garut -c "SELECT version();" 2>/dev/null || echo "❌ Connection failed"

echo "📋 Current app container DATABASE_URL:"
docker exec ppid-app-1 printenv DATABASE_URL 2>/dev/null || echo "❌ App container not running"

echo "🔧 Suggested fix:"
echo "Run: ./fix-database-connection.sh"