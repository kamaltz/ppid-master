#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_debug() { echo -e "${BLUE}[DEBUG]${NC} $1"; }

log_info "PPID Master Deployment Debug"
echo "=================================="

# Check if deployment directory exists
if [ ! -d "/opt/ppid" ]; then
    log_error "Deployment directory /opt/ppid not found!"
    exit 1
fi

cd /opt/ppid

# Check Docker and Docker Compose
log_debug "Checking Docker..."
if command -v docker &> /dev/null; then
    echo "✓ Docker installed: $(docker --version)"
else
    log_error "Docker not installed"
fi

if command -v docker-compose &> /dev/null; then
    echo "✓ Docker Compose installed: $(docker-compose --version)"
else
    log_error "Docker Compose not installed"
fi

# Check if containers are running
log_debug "Checking containers..."
if docker-compose ps | grep -q "Up"; then
    echo "✓ Containers are running:"
    docker-compose ps
else
    log_error "Containers are not running!"
    echo "Container status:"
    docker-compose ps
fi

# Check container logs
log_debug "Checking application logs (last 20 lines)..."
echo "--- APP LOGS ---"
docker-compose logs --tail=20 app 2>/dev/null || log_error "Cannot get app logs"

echo ""
echo "--- POSTGRES LOGS ---"
docker-compose logs --tail=10 postgres 2>/dev/null || log_error "Cannot get postgres logs"

# Check database connection
log_debug "Testing database connection..."
if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "✓ Database is ready"
    
    # Check if tables exist
    TABLE_COUNT=$(docker-compose exec -T postgres psql -U postgres -d ppid_garut -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' \n' || echo "0")
    echo "✓ Database tables: $TABLE_COUNT"
    
    # Check admin count
    ADMIN_COUNT=$(docker-compose exec -T postgres psql -U postgres -d ppid_garut -t -c "SELECT COUNT(*) FROM admin;" 2>/dev/null | tr -d ' \n' || echo "0")
    echo "✓ Admin accounts: $ADMIN_COUNT"
else
    log_error "Database is not ready"
fi

# Check application health
log_debug "Testing application health..."
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✓ Application health check: OK"
    HEALTH_RESPONSE=$(curl -s http://localhost:3000/api/health 2>/dev/null || echo "No response")
    echo "  Response: $HEALTH_RESPONSE"
else
    log_error "Application health check: FAILED"
    echo "  Trying to connect to port 3000..."
    if netstat -tlnp 2>/dev/null | grep -q ":3000"; then
        echo "  ✓ Port 3000 is listening"
    else
        log_error "  Port 3000 is not listening"
    fi
fi

# Check Nginx
log_debug "Checking Nginx..."
if systemctl is-active nginx > /dev/null 2>&1; then
    echo "✓ Nginx is running"
    
    if nginx -t > /dev/null 2>&1; then
        echo "✓ Nginx configuration is valid"
    else
        log_error "Nginx configuration is invalid"
        nginx -t
    fi
else
    log_error "Nginx is not running"
fi

# Check SSL certificate
log_debug "Checking SSL certificate..."
SSL_DIR="/etc/ssl/ppid-selfsigned"
if [ -f "$SSL_DIR/selfsigned.crt" ] && [ -f "$SSL_DIR/selfsigned.key" ]; then
    echo "✓ SSL certificate exists"
    CERT_EXPIRY=$(openssl x509 -in "$SSL_DIR/selfsigned.crt" -noout -enddate 2>/dev/null | cut -d= -f2 || echo "Unknown")
    echo "  Expires: $CERT_EXPIRY"
else
    log_error "SSL certificate missing"
fi

# Test external connectivity
log_debug "Testing external connectivity..."
if curl -k -f https://167.172.83.55/api/health > /dev/null 2>&1; then
    echo "✓ External HTTPS access: OK"
else
    log_error "External HTTPS access: FAILED"
    
    # Test HTTP
    if curl -f http://167.172.83.55/api/health > /dev/null 2>&1; then
        echo "✓ External HTTP access: OK (but HTTPS failed)"
    else
        log_error "External HTTP access: FAILED"
    fi
fi

# Check firewall
log_debug "Checking firewall..."
if command -v ufw &> /dev/null; then
    UFW_STATUS=$(ufw status | head -1)
    echo "UFW Status: $UFW_STATUS"
    if ufw status | grep -q "80\|443"; then
        echo "✓ HTTP/HTTPS ports are allowed"
    else
        log_warn "HTTP/HTTPS ports may not be allowed in firewall"
    fi
else
    echo "UFW not installed"
fi

# Check environment variables
log_debug "Checking environment variables..."
if [ -f ".env.production" ]; then
    echo "✓ Environment file exists"
    echo "  JWT_SECRET length: $(grep JWT_SECRET .env.production | cut -d= -f2 | wc -c)"
    echo "  POSTGRES_PASSWORD length: $(grep POSTGRES_PASSWORD .env.production | cut -d= -f2 | wc -c)"
else
    log_warn "Environment file missing"
fi

# Summary and recommendations
echo ""
echo "=================================="
log_info "RECOMMENDATIONS"
echo "=================================="

# Check if app is accessible
if ! curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "1. Application is not responding. Try:"
    echo "   cd /opt/ppid && docker-compose restart app"
    echo "   cd /opt/ppid && docker-compose logs app"
fi

# Check if database needs setup
if [ "$ADMIN_COUNT" = "0" ]; then
    echo "2. Database appears empty. Try:"
    echo "   cd /opt/ppid && docker-compose exec -T app npx prisma migrate deploy"
    echo "   cd /opt/ppid && docker-compose exec -T app npx prisma db seed"
fi

# Check if external access fails
if ! curl -k -f https://167.172.83.55/api/health > /dev/null 2>&1; then
    echo "3. External access failing. Check:"
    echo "   - Server IP/domain configuration"
    echo "   - Firewall settings: ufw status"
    echo "   - Nginx configuration: nginx -t"
fi

echo ""
log_info "Debug completed. Check the output above for issues."