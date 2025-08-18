#!/bin/bash
set -e

echo "🖼️ Fixing image serving..."

cd ~/ppid-master

# Fix uploads permissions
sudo chown -R 1001:1001 uploads
sudo chmod -R 755 uploads

# Update Nginx config to serve static files
sudo tee /etc/nginx/sites-available/ppid-master << 'EOF'
server {
    listen 80;
    server_name _;
    client_max_body_size 50M;

    # Serve uploads directly
    location /uploads/ {
        alias /root/ppid-master/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri $uri/ =404;
    }

    # Proxy everything else to app
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Reload Nginx
sudo nginx -t && sudo systemctl reload nginx

# Fix container uploads permissions
docker-compose exec -T app sh -c "
mkdir -p /app/public/uploads/images
chown -R nextjs:nodejs /app/public/uploads
chmod -R 755 /app/public/uploads
" 2>/dev/null || true

echo "✅ Image serving fixed!"
echo "📁 Uploads path: /root/ppid-master/uploads/"