# 🚀 Manual VPS Deployment Guide

## Prerequisites
- Ubuntu 20.04+ VPS
- Domain: `ppid.garut.kamaltz.fun` pointing to VPS IP
- Root/sudo access

## 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y curl wget git nginx postgresql postgresql-contrib certbot python3-certbot-nginx

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2
```

## 2. PostgreSQL Setup

```bash
# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << 'EOF'
CREATE DATABASE ppid_garut;
CREATE USER ppid_user WITH PASSWORD 'ppid_secure_password_2025';
GRANT ALL PRIVILEGES ON DATABASE ppid_garut TO ppid_user;
ALTER USER ppid_user CREATEDB;
\q
EOF
```

## 3. Application Setup

```bash
# Create app directory
sudo mkdir -p /opt/ppid
sudo chown $USER:$USER /opt/ppid
cd /opt/ppid

# Clone repository
git clone https://github.com/your-repo/ppid-master.git .

# Install dependencies
npm install

# Create production environment
cat > .env.production << 'EOF'
DATABASE_URL="postgresql://ppid_user:ppid_secure_password_2025@localhost:5432/ppid_garut?schema=public"
JWT_SECRET="ppid-garut-production-jwt-secret-2025-secure"
NEXT_PUBLIC_API_URL="https://ppid.garut.kamaltz.fun/api"
NODE_ENV="production"
EOF

# Setup database
npx prisma generate
npx prisma migrate deploy
npx prisma db seed

# Build application
npm run build

# Create uploads directory
mkdir -p public/uploads/images
chmod 755 public/uploads
```

## 4. PM2 Process Manager

```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'ppid-garut',
    script: 'npm',
    args: 'start',
    cwd: '/opt/ppid',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: '/opt/ppid/logs/err.log',
    out_file: '/opt/ppid/logs/out.log',
    log_file: '/opt/ppid/logs/combined.log',
    time: true
  }]
}
EOF

# Create logs directory
mkdir -p logs

# Start application with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 5. Nginx Configuration

```bash
# Create Nginx config
sudo tee /etc/nginx/sites-available/ppid-garut << 'EOF'
server {
    listen 80;
    server_name ppid.garut.kamaltz.fun www.ppid.garut.kamaltz.fun;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Client settings
    client_max_body_size 50M;
    
    # Static files
    location /uploads/ {
        alias /opt/ppid/public/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri $uri/ =404;
    }
    
    # Next.js static files
    location /_next/static/ {
        alias /opt/ppid/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Main application
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
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Enable site
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/ppid-garut /etc/nginx/sites-enabled/

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

## 6. SSL Certificate (HTTPS)

```bash
# Install SSL certificate
sudo certbot --nginx -d ppid.garut.kamaltz.fun -d www.ppid.garut.kamaltz.fun --non-interactive --agree-tos --email admin@kamaltz.fun

# Setup auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx" | sudo crontab -
```

## 7. Firewall Setup

```bash
# Configure UFW
sudo ufw --force enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

## 8. Monitoring & Maintenance

```bash
# Create backup script
cat > /opt/ppid/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/ppid/backups"
mkdir -p $BACKUP_DIR

# Database backup
pg_dump -h localhost -U ppid_user -d ppid_garut > "$BACKUP_DIR/ppid_backup_$DATE.sql"

# Keep only last 7 days
find $BACKUP_DIR -name "ppid_backup_*.sql" -mtime +7 -delete

echo "Backup completed: ppid_backup_$DATE.sql"
EOF

chmod +x /opt/ppid/backup.sh

# Create update script
cat > /opt/ppid/update.sh << 'EOF'
#!/bin/bash
cd /opt/ppid
git pull origin main
npm install
npm run build
pm2 restart ppid-garut
echo "Update completed"
EOF

chmod +x /opt/ppid/update.sh

# Setup daily backup cron
echo "0 2 * * * /opt/ppid/backup.sh" | crontab -
```

## 9. Verification

```bash
# Check services
sudo systemctl status postgresql
sudo systemctl status nginx
pm2 status

# Test application
curl https://ppid.garut.kamaltz.fun/api/health

# Check logs
pm2 logs ppid-garut
tail -f /var/log/nginx/access.log
```

## 10. Default Accounts

After deployment, login with:
- **Admin**: admin@garut.go.id / Garut@2025?
- **PPID Utama**: ppid.utama@garut.go.id / Garut@2025?

## Management Commands

```bash
# Application management
pm2 restart ppid-garut    # Restart app
pm2 stop ppid-garut       # Stop app
pm2 logs ppid-garut       # View logs

# Database management
./backup.sh               # Manual backup
./update.sh              # Update application

# Nginx management
sudo nginx -t             # Test config
sudo systemctl reload nginx  # Reload config

# SSL certificate
sudo certbot certificates  # Check certificates
sudo certbot renew        # Manual renewal
```

## Troubleshooting

### Application won't start
```bash
pm2 logs ppid-garut
cd /opt/ppid && npm run build
pm2 restart ppid-garut
```

### Database connection issues
```bash
sudo -u postgres psql -d ppid_garut -c "SELECT 1;"
cd /opt/ppid && npx prisma db push
```

### SSL certificate issues
```bash
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

## Security Checklist

- ✅ Firewall configured (UFW)
- ✅ SSL/HTTPS enabled
- ✅ Security headers set
- ✅ Database user with limited privileges
- ✅ Application runs as non-root user
- ✅ File upload restrictions
- ✅ Automated backups
- ✅ Log rotation

## Performance Optimization

```bash
# Enable Nginx gzip
sudo tee -a /etc/nginx/nginx.conf << 'EOF'
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
EOF

# Restart Nginx
sudo systemctl reload nginx

# Optimize PostgreSQL (optional)
sudo -u postgres psql -d ppid_garut -c "VACUUM ANALYZE;"
```

**Deployment Complete!** 🎉

Access your application at: https://ppid.garut.kamaltz.fun