#!/bin/bash
#
# Hamburg ParkFinder - SSL Setup Script
# This script configures SSL certificates using Let's Encrypt
#

set -e

echo "🔒 Hamburg ParkFinder - SSL Setup Script"
echo "========================================="
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

# Check arguments
if [ -z "$1" ]; then
    print_error "Usage: ./setup-ssl.sh your-domain.com"
    echo ""
    echo "Example:"
    echo "  ./setup-ssl.sh parkfinder.hamburg.de"
    echo ""
    exit 1
fi

DOMAIN=$1
WWW_DOMAIN="www.$DOMAIN"

# Check if running as regular user
if [ "$EUID" -eq 0 ]; then
    print_error "Please run as regular user (not root). The script will use sudo when needed."
    exit 1
fi

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    print_error "Certbot is not installed!"
    echo "Please run: sudo apt install certbot python3-certbot-nginx"
    exit 1
fi

# Check if NGINX is running
if ! systemctl is-active --quiet nginx; then
    print_error "NGINX is not running!"
    echo "Please start NGINX: sudo systemctl start nginx"
    exit 1
fi

# Test DNS resolution
print_info "Testing DNS resolution for $DOMAIN..."
if ! host $DOMAIN > /dev/null 2>&1; then
    print_error "DNS resolution failed for $DOMAIN"
    echo ""
    echo "Please ensure:"
    echo "  1. Your domain's A record points to this server's IP"
    echo "  2. DNS has propagated (can take 5-60 minutes)"
    echo "  3. Test with: ping $DOMAIN"
    echo ""
    exit 1
fi
print_success "DNS resolution successful"
echo ""

# Get email for Let's Encrypt
print_info "Enter email address for Let's Encrypt notifications:"
read -p "Email: " EMAIL

if [ -z "$EMAIL" ]; then
    print_error "Email is required!"
    exit 1
fi

# Check if certificate already exists
if sudo certbot certificates 2>/dev/null | grep -q "$DOMAIN"; then
    print_info "Certificate already exists for $DOMAIN"
    read -p "Do you want to renew it? (y/N): " RENEW

    if [[ $RENEW =~ ^[Yy]$ ]]; then
        print_info "Renewing certificate..."
        sudo certbot renew --force-renewal --nginx
    else
        print_info "Skipping certificate creation"
        exit 0
    fi
else
    # Obtain certificate
    print_info "Obtaining SSL certificate from Let's Encrypt..."
    echo ""
    print_info "This will:"
    echo "  1. Verify domain ownership"
    echo "  2. Obtain SSL certificate"
    echo "  3. Configure NGINX automatically"
    echo "  4. Setup auto-renewal"
    echo ""

    sudo certbot --nginx \
        -d $DOMAIN \
        -d $WWW_DOMAIN \
        --non-interactive \
        --agree-tos \
        --email $EMAIL \
        --redirect
fi

print_success "SSL certificate obtained and configured!"
echo ""

# Test auto-renewal
print_info "Testing certificate auto-renewal..."
sudo certbot renew --dry-run
print_success "Auto-renewal test passed"
echo ""

# Display certificate info
print_info "Certificate information:"
sudo certbot certificates | grep -A 10 "$DOMAIN"
echo ""

# Update frontend .env if it exists
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
FRONTEND_ENV="$PROJECT_ROOT/frontend/.env"

if [ -f "$FRONTEND_ENV" ]; then
    print_info "Updating frontend .env with HTTPS URL..."
    sed -i "s|VITE_API_URL=.*|VITE_API_URL=https://$DOMAIN/api|g" "$FRONTEND_ENV"
    print_success "Frontend .env updated"

    print_info "Rebuilding frontend..."
    cd "$PROJECT_ROOT/frontend"
    npm run build
    print_success "Frontend rebuilt with HTTPS URLs"
fi

echo ""
echo "========================================"
echo "🎉 SSL Setup Complete!"
echo "========================================"
echo ""
echo "Your application is now secured with HTTPS:"
echo "  🔒 https://$DOMAIN"
echo "  🔒 https://$WWW_DOMAIN"
echo ""
echo "Certificate details:"
echo "  • Issuer: Let's Encrypt"
echo "  • Valid for: 90 days"
echo "  • Auto-renewal: Enabled (runs every 60 days)"
echo ""
echo "Certificate locations:"
echo "  • Certificate: /etc/letsencrypt/live/$DOMAIN/fullchain.pem"
echo "  • Private Key: /etc/letsencrypt/live/$DOMAIN/privkey.pem"
echo ""
print_info "Visit https://$DOMAIN to test your secure connection!"
echo ""
