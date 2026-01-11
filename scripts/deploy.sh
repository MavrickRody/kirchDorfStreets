#!/bin/bash
#
# Hamburg ParkFinder - Deployment Script
# This script builds and deploys the application
#

set -e

echo "🚗 Hamburg ParkFinder - Deployment Script"
echo "=========================================="
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

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    print_error "Backend .env file not found!"
    echo "Please create backend/.env with required configuration."
    echo "See DEPLOYMENT.md for details."
    exit 1
fi

if [ ! -f "frontend/.env" ]; then
    print_error "Frontend .env file not found!"
    echo "Please create frontend/.env with required configuration."
    echo "See DEPLOYMENT.md for details."
    exit 1
fi

# 1. Pull latest changes
print_info "Pulling latest changes from git..."
git pull
print_success "Code updated"
echo ""

# 2. Install dependencies
print_info "Installing dependencies..."

# Root dependencies
npm install

# Backend dependencies
print_info "Installing backend dependencies..."
cd backend
npm install
cd ..

# Frontend dependencies
print_info "Installing frontend dependencies..."
cd frontend
npm install
cd ..

print_success "Dependencies installed"
echo ""

# 3. Build backend
print_info "Building backend..."
cd backend
npm run build

if [ ! -f "dist/server.js" ]; then
    print_error "Backend build failed!"
    exit 1
fi

print_success "Backend built successfully"
cd ..
echo ""

# 4. Build frontend
print_info "Building frontend..."
cd frontend
npm run build

if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
    print_error "Frontend build failed!"
    exit 1
fi

print_success "Frontend built successfully"
cd ..
echo ""

# 5. Test backend (optional)
print_info "Testing backend build..."
timeout 5 node backend/dist/server.js &
BACKEND_PID=$!
sleep 3

if ps -p $BACKEND_PID > /dev/null; then
    kill $BACKEND_PID 2>/dev/null || true
    print_success "Backend test passed"
else
    print_error "Backend test failed"
    exit 1
fi
echo ""

# 6. Restart backend with PM2
print_info "Deploying backend with PM2..."

if pm2 list | grep -q "parkfinder-backend"; then
    print_info "Restarting existing backend process..."
    pm2 restart parkfinder-backend
else
    print_info "Starting new backend process..."
    cd backend
    pm2 start dist/server.js --name parkfinder-backend
    pm2 save
    cd ..
fi

print_success "Backend deployed"
echo ""

# 7. Check PM2 status
print_info "Backend status:"
pm2 list | grep parkfinder-backend
echo ""

# 8. Reload NGINX (for frontend static files)
print_info "Reloading NGINX..."
sudo nginx -t && sudo systemctl reload nginx
print_success "NGINX reloaded"
echo ""

# 9. Display summary
echo "========================================"
echo "🎉 Deployment Complete!"
echo "========================================"
echo ""
echo "Services status:"
pm2 list
echo ""
echo "Backend logs:"
echo "  pm2 logs parkfinder-backend"
echo ""
echo "NGINX logs:"
echo "  sudo tail -f /var/log/nginx/parkfinder_error.log"
echo ""
echo "Application URLs:"
echo "  Frontend: http://$(hostname -I | awk '{print $1}')"
echo "  Backend API: http://$(hostname -I | awk '{print $1}')/api"
echo ""
print_info "If you have a domain configured, visit: https://your-domain.com"
echo ""
