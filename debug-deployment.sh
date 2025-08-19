#!/bin/bash

echo "🔍 PPID Master - Deployment Debug Script"

echo "📊 Container Status:"
docker-compose -f docker-compose.deploy.yml ps

echo ""
echo "🏥 Health Check:"
curl -s http://localhost:3000/api/health | jq . 2>/dev/null || curl -s http://localhost:3000/api/health

echo ""
echo "📋 Application Logs (last 50 lines):"
docker-compose -f docker-compose.deploy.yml logs --tail=50 app

echo ""
echo "🗄️ Database Logs (last 20 lines):"
docker-compose -f docker-compose.deploy.yml logs --tail=20 postgres

echo ""
echo "🔗 Database Connection Test:"
docker-compose -f docker-compose.deploy.yml exec postgres pg_isready -U postgres -d ppid_garut

echo ""
echo "📊 Database Tables:"
docker-compose -f docker-compose.deploy.yml exec postgres psql -U postgres -d ppid_garut -c "\dt"

echo ""
echo "👥 User Accounts:"
docker-compose -f docker-compose.deploy.yml exec postgres psql -U postgres -d ppid_garut -c "SELECT 'admin' as table_name, email, nama FROM admin UNION SELECT 'ppid' as table_name, email, nama FROM ppid UNION SELECT 'pemohon' as table_name, email, nama FROM pemohon;"