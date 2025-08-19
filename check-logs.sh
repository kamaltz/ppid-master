#!/bin/bash

echo "🔍 Checking application logs..."

cd /opt/ppid

# Check app logs
echo "=== App Logs ==="
sudo docker-compose logs --tail=50 app

# Check database tables
echo "=== Database Tables ==="
sudo docker-compose exec -T postgres psql -U postgres -d ppid_garut -c "\dt"

# Check if informasi_publik table exists and its structure
echo "=== InformasiPublik Table Structure ==="
sudo docker-compose exec -T postgres psql -U postgres -d ppid_garut -c "\d informasi_publik"