#!/bin/bash
set -e

echo "🔧 Fixing DNS and testing without SSL..."

# Get server IP
SERVER_IP=$(curl -s ifconfig.me)
echo "Server IP: $SERVER_IP"

# Check if domain resolves to this server
DOMAIN_IP=$(dig +short ppidgarut.kamaltz.fun)
echo "Domain resolves to: $DOMAIN_IP"

if [ "$SERVER_IP" != "$DOMAIN_IP" ]; then
    echo "❌ Domain does not point to this server!"
    echo "Please update DNS record for ppidgarut.kamaltz.fun to point to $SERVER_IP"
    echo ""
    echo "For now, testing with IP address..."
    
    # Update Nginx to accept IP access
    sudo tee /etc/nginx/sites-available/ppid << EOF
server {
    listen 80;
    server_name $SERVER_IP ppidgarut.kamaltz.fun;
    client_max_body_size 50M;

    location /uploads/ {
        alias /opt/ppid/uploads/;
        expires 1y;
        add_header Cache-Control "public";
        try_files \$uri \$uri/ =404;
    }

    location /_next/image {
        return 404;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

    sudo nginx -t && sudo systemctl reload nginx
    
    echo "✅ Nginx configured for IP access"
    echo "🌐 Test with: http://$SERVER_IP"
    
else
    echo "✅ Domain points to this server"
    
    # Test HTTP first
    echo "Testing HTTP access..."
    curl -I http://ppidgarut.kamaltz.fun || echo "HTTP test failed"
    
    # Check firewall
    echo "Checking firewall..."
    sudo ufw status
    
    echo "🌐 Test with: http://ppidgarut.kamaltz.fun"
fi

# Test local app
echo "Testing local app..."
curl -I http://localhost:3000 || echo "App not responding locally"