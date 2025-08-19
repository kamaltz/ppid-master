#!/bin/bash
set -e

cd /opt/ppid

# Update Nginx config to handle Next.js image optimization
sudo tee /etc/nginx/sites-available/ppid-master << 'EOF'
server {
    listen 80;
    server_name _;
    client_max_body_size 50M;

    # Direct access to uploads
    location /uploads/ {
        alias /opt/ppid/uploads/;
        expires 1y;
        add_header Cache-Control "public";
        try_files $uri $uri/ =404;
    }

    # Handle Next.js image optimization
    location /_next/image {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Proxy everything else
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

sudo nginx -t && sudo systemctl reload nginx

# Fix uploads permissions
sudo chown -R 1001:1001 /opt/ppid/uploads
sudo chmod -R 755 /opt/ppid/uploads

echo "✅ Image optimization fixed"