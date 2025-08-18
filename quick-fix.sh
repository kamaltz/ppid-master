#!/bin/bash
set -e

cd ~/ppid-master

# Fix uploads path and permissions
sudo mkdir -p /root/ppid-master/uploads/images
sudo chown -R 1001:1001 /root/ppid-master/uploads
sudo chmod -R 755 /root/ppid-master/uploads

# Update Nginx config
sudo tee /etc/nginx/sites-available/ppid-master << 'EOF'
server {
    listen 80;
    server_name _;
    client_max_body_size 50M;

    location /uploads/ {
        alias /root/ppid-master/uploads/;
        expires 1y;
        add_header Cache-Control "public";
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

sudo nginx -t && sudo systemctl reload nginx

# Restart app
docker-compose restart app

echo "✅ Fixed!"