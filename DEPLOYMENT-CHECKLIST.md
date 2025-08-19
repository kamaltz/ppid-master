# 🚀 PPID Master - Production Deployment Checklist

## Pre-Deployment Requirements

### System Requirements
- [ ] **Server**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- [ ] **RAM**: Minimum 2GB (Recommended: 4GB+)
- [ ] **Storage**: Minimum 10GB free space
- [ ] **Network**: Public IP with ports 80, 443 accessible
- [ ] **Domain**: DNS A record pointing to server IP

### Prerequisites
- [ ] **Root/Sudo Access**: Non-root user with sudo privileges
- [ ] **Domain Setup**: DNS configured and propagated
- [ ] **Email**: Valid email for SSL certificate
- [ ] **Firewall**: UFW or iptables available

## Deployment Options

### Option 1: Quick Deploy (Recommended)
```bash
# Download and run production deployment
curl -fsSL https://raw.githubusercontent.com/your-repo/ppid-master/main/deploy-production.sh | bash -s -- your-domain.com admin@yourdomain.com
```

### Option 2: Manual Deploy
```bash
# Clone repository
git clone https://github.com/your-repo/ppid-master.git
cd ppid-master

# Make executable and run
chmod +x install.sh
./install.sh
```

### Option 3: Docker Hub Deploy
```bash
# Download deployment files
curl -O https://raw.githubusercontent.com/your-repo/ppid-master/main/docker-compose.deploy.yml
curl -O https://raw.githubusercontent.com/your-repo/ppid-master/main/deploy.sh

# Configure and deploy
chmod +x deploy.sh
./deploy.sh
```

## Post-Deployment Verification

### 1. Service Health Checks
- [ ] **Database**: `docker-compose exec postgres pg_isready -U postgres`
- [ ] **Application**: `curl https://your-domain.com/api/health`
- [ ] **SSL Certificate**: `curl -I https://your-domain.com`
- [ ] **Docker Services**: `docker-compose ps`

### 2. Security Verification
- [ ] **Firewall Status**: `sudo ufw status`
- [ ] **Fail2ban Status**: `sudo systemctl status fail2ban`
- [ ] **SSL Grade**: Test at [SSL Labs](https://www.ssllabs.com/ssltest/)
- [ ] **Security Headers**: Test at [Security Headers](https://securityheaders.com/)

### 3. Functionality Tests
- [ ] **Homepage**: Load main page
- [ ] **Admin Login**: admin@garut.go.id / Garut@2025?
- [ ] **User Registration**: Create test account
- [ ] **File Upload**: Test image upload
- [ ] **API Endpoints**: Test key API routes

### 4. Performance Tests
- [ ] **Page Load Speed**: < 3 seconds
- [ ] **API Response Time**: < 500ms
- [ ] **Database Queries**: Monitor slow queries
- [ ] **Memory Usage**: < 80% utilization

## Configuration Files

### Environment Variables
```bash
# Location: /opt/ppid/.env.production
JWT_SECRET=<generated-secret>
POSTGRES_PASSWORD=<generated-password>
DOMAIN=your-domain.com
EMAIL=admin@yourdomain.com
```

### Docker Compose
```bash
# Location: /opt/ppid/docker-compose.yml
# Services: postgres, app
# Volumes: postgres_data, uploads, logs, backups
```

### Nginx Configuration
```bash
# Location: /etc/nginx/sites-available/ppid-master
# Features: SSL, Rate limiting, Security headers, Gzip
```

## Maintenance Commands

### Daily Operations
```bash
cd /opt/ppid

# Check status
./monitor.sh

# View logs
docker-compose logs -f app

# Restart services
docker-compose restart
```

### Weekly Maintenance
```bash
# Manual backup
./backup.sh

# Update application
./update.sh

# Check disk space
df -h /opt/ppid

# Review security logs
sudo journalctl -u fail2ban
```

### Monthly Tasks
```bash
# Update system packages
sudo apt update && sudo apt upgrade

# Rotate logs
docker-compose logs --tail=0 app > /dev/null

# Review SSL certificate
sudo certbot certificates

# Security audit
sudo lynis audit system
```

## Troubleshooting

### Common Issues

#### 1. Application Won't Start
```bash
# Check logs
docker-compose logs app

# Verify database connection
docker-compose exec app npx prisma db push

# Restart services
docker-compose restart
```

#### 2. SSL Certificate Issues
```bash
# Renew certificate
sudo certbot renew --force-renewal

# Check certificate status
sudo certbot certificates

# Test SSL configuration
sudo nginx -t
```

#### 3. Database Connection Errors
```bash
# Check database status
docker-compose exec postgres pg_isready -U postgres

# Reset database connection
docker-compose restart postgres app

# Check database logs
docker-compose logs postgres
```

#### 4. High Memory Usage
```bash
# Check memory usage
free -h
docker stats

# Restart services to free memory
docker-compose restart

# Optimize database
docker-compose exec postgres vacuumdb -U postgres -d ppid_garut
```

### Emergency Procedures

#### Complete System Restore
```bash
# Stop services
docker-compose down

# Restore from backup
docker-compose exec postgres psql -U postgres -d ppid_garut < backups/latest_backup.sql

# Restart services
docker-compose up -d
```

#### Rollback Deployment
```bash
# Use previous image version
docker-compose pull kamaltz/ppid-master:previous
docker-compose up -d
```

## Monitoring & Alerts

### Health Monitoring
- **Endpoint**: `https://your-domain.com/api/health`
- **Expected Response**: `{"status":"healthy","database":"connected"}`
- **Monitoring Frequency**: Every 5 minutes

### Log Monitoring
- **Application Logs**: `/opt/ppid/logs/`
- **Nginx Logs**: `/var/log/nginx/`
- **System Logs**: `journalctl -u docker`

### Performance Metrics
- **Response Time**: < 500ms
- **Memory Usage**: < 2GB
- **Disk Usage**: < 80%
- **CPU Usage**: < 70%

## Security Hardening

### Implemented Security Measures
- ✅ **Firewall**: UFW with restricted ports
- ✅ **Fail2ban**: Intrusion prevention
- ✅ **SSL/TLS**: Let's Encrypt certificates
- ✅ **Rate Limiting**: API and login protection
- ✅ **Security Headers**: OWASP recommended headers
- ✅ **Container Security**: Non-root containers
- ✅ **Database Security**: Encrypted connections

### Additional Security Recommendations
- [ ] **VPN Access**: Restrict admin access to VPN
- [ ] **2FA**: Implement two-factor authentication
- [ ] **WAF**: Web Application Firewall
- [ ] **Monitoring**: Security monitoring tools
- [ ] **Backups**: Encrypted off-site backups

## Support & Documentation

### Resources
- **GitHub Repository**: https://github.com/your-repo/ppid-master
- **Documentation**: README.md and wiki
- **Issues**: GitHub Issues tracker
- **Discussions**: GitHub Discussions

### Getting Help
1. Check this checklist and troubleshooting guide
2. Review application logs and error messages
3. Search existing GitHub issues
4. Create new issue with detailed information
5. Contact system administrator

---

**Deployment Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Failed

**Last Updated**: $(date)
**Version**: Latest
**Environment**: Production