#!/bin/bash
#
# Hamburg ParkFinder - Status Check Script
# This script checks the status of all services and displays logs
#

echo "🔍 Hamburg ParkFinder - System Status"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}━━━ $1 ━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# System Information
print_header "System Information"
echo "Hostname: $(hostname)"
echo "IP Address: $(hostname -I | awk '{print $1}')"
echo "OS: $(lsb_release -d | cut -f2)"
echo "Uptime: $(uptime -p)"
echo ""

# Disk Usage
print_header "Disk Usage"
df -h / | tail -n1 | awk '{print "Used: " $3 " / " $2 " (" $5 ")"}'
echo ""

# Memory Usage
print_header "Memory Usage"
free -h | grep Mem | awk '{print "Used: " $3 " / " $2}'
echo ""

# Node.js Version
print_header "Node.js"
if command -v node &> /dev/null; then
    echo "Version: $(node --version)"
    echo "npm: $(npm --version)"
    print_success "Node.js installed"
else
    print_error "Node.js not installed"
fi
echo ""

# PostgreSQL Status
print_header "PostgreSQL Database"
if systemctl is-active --quiet postgresql; then
    print_success "PostgreSQL is running"
    echo "Version: $(psql --version | head -n1)"

    # Check database connection
    if [ -f "$HOME/.db_credentials" ]; then
        source "$HOME/.db_credentials"
        if PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h $DB_HOST -d $DB_NAME -c "SELECT 1;" &>/dev/null; then
            print_success "Database connection successful"

            # Get database size
            DB_SIZE=$(PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h $DB_HOST -d $DB_NAME -t -c "SELECT pg_size_pretty(pg_database_size('$DB_NAME'));" | xargs)
            echo "Database size: $DB_SIZE"
        else
            print_error "Cannot connect to database"
        fi
    fi
else
    print_error "PostgreSQL is not running"
    echo "Start with: sudo systemctl start postgresql"
fi
echo ""

# NGINX Status
print_header "NGINX Web Server"
if systemctl is-active --quiet nginx; then
    print_success "NGINX is running"
    echo "Version: $(nginx -v 2>&1)"

    # Check if parkfinder site is enabled
    if [ -L "/etc/nginx/sites-enabled/parkfinder" ]; then
        print_success "ParkFinder site is enabled"
    else
        print_error "ParkFinder site is not enabled"
    fi

    # Test configuration
    if sudo nginx -t &>/dev/null; then
        print_success "NGINX configuration is valid"
    else
        print_error "NGINX configuration has errors"
    fi
else
    print_error "NGINX is not running"
    echo "Start with: sudo systemctl start nginx"
fi
echo ""

# Backend Status (PM2)
print_header "Backend Application (PM2)"
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "parkfinder-backend"; then
        print_success "Backend is running"
        echo ""
        pm2 list | grep -E "(App name|parkfinder-backend)"
        echo ""

        # Check if backend is responding
        if curl -s http://localhost:5000/api/health > /dev/null; then
            print_success "Backend API is responding"
            HEALTH_STATUS=$(curl -s http://localhost:5000/api/health)
            echo "Health check: $HEALTH_STATUS"
        else
            print_error "Backend API is not responding"
        fi
    else
        print_error "Backend is not running"
        echo "Start with: cd backend && pm2 start dist/server.js --name parkfinder-backend"
    fi
else
    print_error "PM2 is not installed"
    echo "Install with: sudo npm install -g pm2"
fi
echo ""

# Frontend Status
print_header "Frontend Application"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
FRONTEND_DIST="$PROJECT_ROOT/frontend/dist"

if [ -d "$FRONTEND_DIST" ] && [ "$(ls -A $FRONTEND_DIST 2>/dev/null)" ]; then
    print_success "Frontend is built"
    echo "Build location: $FRONTEND_DIST"
    DIST_SIZE=$(du -sh "$FRONTEND_DIST" | cut -f1)
    echo "Build size: $DIST_SIZE"
else
    print_error "Frontend is not built"
    echo "Build with: cd frontend && npm run build"
fi
echo ""

# SSL Certificate Status
print_header "SSL Certificate"
if command -v certbot &> /dev/null; then
    CERT_COUNT=$(sudo certbot certificates 2>/dev/null | grep -c "Certificate Name:" || echo "0")
    if [ "$CERT_COUNT" -gt 0 ]; then
        print_success "SSL certificate(s) installed: $CERT_COUNT"
        echo ""
        sudo certbot certificates 2>/dev/null | grep -E "(Certificate Name|Domains|Expiry Date)"
    else
        print_info "No SSL certificates found"
        echo "Setup with: ./scripts/setup-ssl.sh your-domain.com"
    fi
else
    print_error "Certbot not installed"
fi
echo ""

# Firewall Status
print_header "Firewall (UFW)"
if command -v ufw &> /dev/null; then
    UFW_STATUS=$(sudo ufw status | head -n1)
    if echo "$UFW_STATUS" | grep -q "active"; then
        print_success "Firewall is active"
        echo ""
        sudo ufw status | grep -E "(22|80|443)" | head -n 3
    else
        print_error "Firewall is inactive"
        echo "Enable with: sudo ufw enable"
    fi
else
    print_error "UFW not installed"
fi
echo ""

# Recent Logs
print_header "Recent Backend Logs (last 10 lines)"
if pm2 list | grep -q "parkfinder-backend"; then
    pm2 logs parkfinder-backend --lines 10 --nostream 2>/dev/null | tail -n 10
else
    echo "Backend not running"
fi
echo ""

print_header "Recent NGINX Error Logs (last 5 lines)"
if [ -f "/var/log/nginx/parkfinder_error.log" ]; then
    sudo tail -n 5 /var/log/nginx/parkfinder_error.log
else
    echo "No error logs found"
fi
echo ""

# Quick Actions
echo "======================================"
echo "📋 Quick Actions"
echo "======================================"
echo ""
echo "View logs:"
echo "  Backend: pm2 logs parkfinder-backend"
echo "  NGINX: sudo tail -f /var/log/nginx/parkfinder_error.log"
echo ""
echo "Restart services:"
echo "  Backend: pm2 restart parkfinder-backend"
echo "  NGINX: sudo systemctl restart nginx"
echo "  PostgreSQL: sudo systemctl restart postgresql"
echo ""
echo "Deploy updates:"
echo "  ./scripts/deploy.sh"
echo ""
