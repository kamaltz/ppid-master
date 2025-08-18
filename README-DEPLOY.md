# 🚀 PPID Master - Production Deployment

## One-Command Deployment

```bash
curl -fsSL https://raw.githubusercontent.com/kamaltz/ppid-master/main/deploy.sh | bash
```

## What Gets Installed:
- ✅ Docker & Docker Compose
- ✅ PostgreSQL Database (persistent)
- ✅ PPID Master Application
- ✅ Nginx Reverse Proxy
- ✅ SSL Certificate (optional)
- ✅ Firewall Configuration
- ✅ File Upload Support

## Features:
- 🌐 **Custom Domain Support** - Enter your domain during setup
- 🔒 **Auto SSL** - Let's Encrypt certificate setup
- 📁 **File Serving** - Images and uploads work correctly
- 🔄 **Auto Restart** - Services restart on failure
- 💾 **Persistent Data** - Database survives container restarts

## Default Accounts:
- **Admin**: admin@garut.go.id / Garut@2025?
- **PPID Utama**: ppid.utama@garut.go.id / Garut@2025?
- **PPID Pelaksana**: ppid.pelaksana@garut.go.id / Garut@2025?
- **Atasan PPID**: atasan.ppid@garut.go.id / Garut@2025?
- **Pemohon**: pemohon@example.com / Garut@2025?

## Management:
```bash
# View logs
sudo docker-compose -f /opt/ppid/docker-compose.yml logs -f

# Restart services
sudo docker-compose -f /opt/ppid/docker-compose.yml restart

# Update application
sudo docker-compose -f /opt/ppid/docker-compose.yml pull
sudo docker-compose -f /opt/ppid/docker-compose.yml up -d

# Backup database
sudo docker-compose -f /opt/ppid/docker-compose.yml exec postgres pg_dump -U postgres ppid_garut > backup.sql
```

## Requirements:
- Ubuntu 18.04+ or CentOS 7+
- 2GB RAM minimum
- 20GB disk space
- Domain name (optional)