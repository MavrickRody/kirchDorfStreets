#!/bin/bash
#
# Hamburg ParkFinder - VM Setup Script
# This script sets up a fresh Ubuntu 22.04 VM with all required dependencies
#

set -e

echo "🚗 Hamburg ParkFinder - VM Setup Script"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please do not run this script as root. Run as regular user with sudo privileges."
    exit 1
fi

print_info "Starting VM setup..."
echo ""

# 1. Update system
print_info "Updating system packages..."
sudo apt update
sudo apt upgrade -y
print_success "System updated"
echo ""

# 2. Install essential tools
print_info "Installing essential tools..."
sudo apt install -y curl wget git build-essential unzip software-properties-common
print_success "Essential tools installed"
echo ""

# 3. Install Node.js 20.x LTS
print_info "Installing Node.js 20.x LTS..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    print_success "Node.js installed: $(node --version)"
else
    print_success "Node.js already installed: $(node --version)"
fi
echo ""

# 4. Install global npm packages
print_info "Installing global npm packages..."
sudo npm install -g pm2 typescript tsx
print_success "Global npm packages installed"
echo ""

# 5. Install PostgreSQL
print_info "Installing PostgreSQL..."
if ! command -v psql &> /dev/null; then
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    print_success "PostgreSQL installed and started"
else
    print_success "PostgreSQL already installed"
fi
echo ""

# 6. Install NGINX
print_info "Installing NGINX..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    print_success "NGINX installed and started"
else
    print_success "NGINX already installed"
fi
echo ""

# 7. Install Certbot
print_info "Installing Certbot for SSL..."
if ! command -v certbot &> /dev/null; then
    sudo apt install -y certbot python3-certbot-nginx
    print_success "Certbot installed"
else
    print_success "Certbot already installed"
fi
echo ""

# 8. Configure UFW Firewall
print_info "Configuring firewall..."
sudo ufw --force enable
sudo ufw allow 22/tcp comment "SSH"
sudo ufw allow 80/tcp comment "HTTP"
sudo ufw allow 443/tcp comment "HTTPS"
print_success "Firewall configured"
echo ""

# 9. Create application directory structure
print_info "Creating application directory structure..."
mkdir -p ~/backups
mkdir -p ~/logs
print_success "Directory structure created"
echo ""

# 10. Configure PostgreSQL
print_info "Setting up PostgreSQL database..."
echo "Please enter a secure password for the database user:"
read -s DB_PASSWORD

sudo -u postgres psql << EOF
-- Check if database exists
SELECT 'CREATE DATABASE parkfinder_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'parkfinder_db')\gexec

-- Check if user exists, if not create
DO
\$\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'parkfinder_user') THEN
      CREATE USER parkfinder_user WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
   END IF;
END
\$\$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE parkfinder_db TO parkfinder_user;

\q
EOF

print_success "PostgreSQL database configured"
echo ""

# 11. Save database credentials
print_info "Saving database credentials..."
cat > ~/.db_credentials << EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=parkfinder_db
DB_USER=parkfinder_user
DB_PASSWORD=$DB_PASSWORD
EOF
chmod 600 ~/.db_credentials
print_success "Database credentials saved to ~/.db_credentials"
echo ""

# 12. Setup Git
print_info "Configuring Git..."
git config --global user.name "ParkFinder Deploy"
git config --global user.email "deploy@parkfinder.local"
print_success "Git configured"
echo ""

# 13. Display summary
echo ""
echo "========================================"
echo "🎉 VM Setup Complete!"
echo "========================================"
echo ""
echo "Installed software:"
echo "  • Ubuntu: $(lsb_release -d | cut -f2)"
echo "  • Node.js: $(node --version)"
echo "  • npm: $(npm --version)"
echo "  • PostgreSQL: $(psql --version | head -n1)"
echo "  • NGINX: $(nginx -v 2>&1)"
echo "  • PM2: $(pm2 --version)"
echo ""
echo "Next steps:"
echo "  1. Clone your repository: git clone <your-repo-url>"
echo "  2. Run the deployment script: ./scripts/deploy.sh"
echo "  3. Configure your domain DNS"
echo "  4. Setup SSL with: ./scripts/setup-ssl.sh your-domain.com"
echo ""
print_info "Database credentials saved in: ~/.db_credentials"
echo ""
