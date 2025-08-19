#!/bin/bash

echo "🔓 Opening firewall ports..."

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

echo "✅ Ports opened!"
echo ""
echo "🌐 Access your website:"
echo "   HTTP:  http://ppidgarut.kamaltz.fun"
echo "   HTTPS: https://ppidgarut.kamaltz.fun (after SSL setup)"
echo ""
echo "📊 Admin login:"
echo "   Email: admin@garut.go.id"
echo "   Password: Garut@2025?"