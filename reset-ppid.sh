#!/bin/bash
set -e

echo "🔄 Resetting PPID Master completely..."

cd /opt/ppid

# Stop and remove everything
sudo docker-compose down -v
sudo docker system prune -f

# Remove uploads and recreate
sudo rm -rf /opt/ppid/uploads
sudo mkdir -p /opt/ppid/uploads/images
sudo chown -R 1001:1001 /opt/ppid/uploads
sudo chmod -R 755 /opt/ppid/uploads

# Start fresh
sudo docker-compose pull
sudo docker-compose up -d
sleep 60

# Force complete database reset
echo "Resetting database completely..."
sudo docker-compose exec -T app sh -c "
export DATABASE_URL='postgresql://postgres:postgres123@postgres:5432/ppid_garut?schema=public'
npx prisma generate
npx prisma db push --force-reset --accept-data-loss
npx prisma db seed
"

# Restart app
sudo docker-compose restart app
sleep 20

echo "✅ Complete reset done!"
echo "🌐 Try: http://$(curl -s ifconfig.me)"
echo "📊 Admin: admin@garut.go.id / Garut@2025?"