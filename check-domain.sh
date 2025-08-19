#!/bin/bash

echo "🔍 Checking domain connectivity..."

# Check DNS resolution
echo "=== DNS Resolution ==="
nslookup ppidgarut.kamaltz.fun || echo "DNS resolution failed"

# Check if domain points to this server
echo "=== Server IP Check ==="
SERVER_IP=$(curl -s ifconfig.me)
DOMAIN_IP=$(dig +short ppidgarut.kamaltz.fun)
echo "Server IP: $SERVER_IP"
echo "Domain IP: $DOMAIN_IP"

if [ "$SERVER_IP" = "$DOMAIN_IP" ]; then
    echo "✅ Domain points to this server"
else
    echo "❌ Domain does not point to this server"
fi

# Test local connection
echo "=== Local Connection Test ==="
curl -I http://localhost:3000 2>/dev/null || echo "App not responding locally"

# Check Caddy status
echo "=== Caddy Status ==="
sudo docker-compose -f /opt/caddy-compose.yml logs --tail=10 caddy

# Test Caddy directly
echo "=== Caddy Direct Test ==="
curl -I http://localhost 2>/dev/null || echo "Caddy not responding"