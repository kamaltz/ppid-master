# 🚀 PPID Master - Easy Installation

## One-Command Installation

### For VPS/Server:
```bash
curl -fsSL https://raw.githubusercontent.com/kamaltz/ppid-master/main/install.sh | bash
```

### Manual Installation:

1. **Connect to VPS:**
```bash
ssh root@YOUR_VPS_IP
```

2. **Run installer:**
```bash
wget https://raw.githubusercontent.com/kamaltz/ppid-master/main/install.sh
chmod +x install.sh
./install.sh
```

## What Gets Installed:
- ✅ Docker & Docker Compose
- ✅ PostgreSQL Database
- ✅ PPID Master Application
- ✅ Nginx Reverse Proxy
- ✅ Firewall Configuration
- ✅ Auto-restart on reboot

## Access Application:
- **URL**: http://YOUR_VPS_IP
- **Admin**: admin@garut.go.id / Garut@2025?

## Management Commands:
```bash
cd ~/ppid-master

# View logs
docker-compose logs -f

# Restart application
docker-compose restart

# Update to latest version
docker-compose pull && docker-compose up -d

# Stop application
docker-compose down

# Backup database
docker-compose exec postgres pg_dump -U postgres ppid_garut > backup.sql
```

## Troubleshooting:
```bash
# Check service status
docker-compose ps

# View application logs
docker-compose logs app

# View database logs
docker-compose logs postgres

# Restart everything
docker-compose down && docker-compose up -d
```

## Requirements:
- Ubuntu 18.04+ or CentOS 7+
- 2GB RAM minimum
- 20GB disk space
- Internet connection