#!/bin/bash
#
# Hamburg ParkFinder - NGINX Setup Script
# This script configures NGINX for the application
#

set -e

echo "🌐 Hamburg ParkFinder - NGINX Setup Script"
echo "==========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Get domain or use IP
print_info "Enter your domain name (or press Enter to use IP address):"
read -p "Domain: " DOMAIN

if [ -z "$DOMAIN" ]; then
    DOMAIN=$(hostname -I | awk '{print $1}')
    print_info "Using IP address: $DOMAIN"
else
    print_info "Using domain: $DOMAIN"
fi

# Get project path
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
FRONTEND_DIST="$PROJECT_ROOT/frontend/dist"

# Check if frontend is built
if [ ! -d "$FRONTEND_DIST" ]; then
    print_error "Frontend not built! Please run: cd frontend && npm run build"
    exit 1
fi

# Create NGINX configuration
print_info "Creating NGINX configuration..."

NGINX_CONFIG="/etc/nginx/sites-available/parkfinder"

sudo tee $NGINX_CONFIG > /dev/null <<EOF
# Hamburg ParkFinder NGINX Configuration
# Generated: $(date)

server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    # Root directory for frontend
    root $FRONTEND_DIST;
    index index.html;

    # Frontend routes (React Router)
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API proxy to backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Buffer settings
        proxy_buffering off;
        proxy_request_buffering off;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Access and error logs
    access_log /var/log/nginx/parkfinder_access.log;
    error_log /var/log/nginx/parkfinder_error.log warn;

    # Client body size limit (for GeoJSON uploads)
    client_max_body_size 10M;
}
EOF

print_success "NGINX configuration created"
echo ""

# Create symlink
print_info "Enabling site..."
sudo ln -sf /etc/nginx/sites-available/parkfinder /etc/nginx/sites-enabled/

# Remove default site if exists
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    print_info "Removing default NGINX site..."
    sudo rm -f /etc/nginx/sites-enabled/default
fi

# Test NGINX configuration
print_info "Testing NGINX configuration..."
if sudo nginx -t; then
    print_success "NGINX configuration is valid"
else
    print_error "NGINX configuration test failed!"
    exit 1
fi
echo ""

# Reload NGINX
print_info "Reloading NGINX..."
sudo systemctl reload nginx
print_success "NGINX reloaded"
echo ""

# Display configuration
echo "========================================"
echo "🎉 NGINX Setup Complete!"
echo "========================================"
echo ""
echo "Configuration file: $NGINX_CONFIG"
echo ""
echo "Your application should now be accessible at:"
if [[ $DOMAIN =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "  📍 http://$DOMAIN"
else
    echo "  📍 http://$DOMAIN"
    echo "  📍 http://www.$DOMAIN (if DNS configured)"
fi
echo ""
echo "Next steps:"
echo "  1. Test the application: curl http://$DOMAIN"
echo "  2. If using a domain, setup SSL: ./scripts/setup-ssl.sh $DOMAIN"
echo ""
print_info "View NGINX logs:"
echo "  sudo tail -f /var/log/nginx/parkfinder_error.log"
echo ""
