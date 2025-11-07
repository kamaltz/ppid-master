#!/bin/bash

echo "🔍 Debugging database connection..."

echo "1. Checking PostgreSQL container status:"
docker-compose -f docker-compose.deploy.yml ps postgres

echo -e "\n2. Checking PostgreSQL logs:"
docker-compose -f docker-compose.deploy.yml logs --tail=20 postgres

echo -e "\n3. Testing database connection from inside container:"
docker-compose -f docker-compose.deploy.yml exec postgres psql -U postgres -d ppid_garut -c "SELECT version();"

echo -e "\n4. Checking if user postgres exists:"
docker-compose -f docker-compose.deploy.yml exec postgres psql -U postgres -d ppid_garut -c "SELECT rolname FROM pg_roles WHERE rolname = 'postgres';"

echo -e "\n5. Listing all databases:"
docker-compose -f docker-compose.deploy.yml exec postgres psql -U postgres -l

echo -e "\n6. Testing app health endpoint:"
curl -s http://localhost:3000/api/health | jq .