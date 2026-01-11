# 🚀 Google Cloud VM Deployment Guide
## Hamburg ParkFinder - Ubuntu Latest

This guide will walk you through deploying the Hamburg ParkFinder app on a Google Cloud VM with Ubuntu 22.04 LTS.

## Table of Contents
1. [Google Cloud VM Setup](#1-google-cloud-vm-setup)
2. [Initial Ubuntu Configuration](#2-initial-ubuntu-configuration)
3. [Install Dependencies](#3-install-dependencies)
4. [Clone and Setup Application](#4-clone-and-setup-application)
5. [Database Setup (PostgreSQL)](#5-database-setup-postgresql)
6. [Environment Configuration](#6-environment-configuration)
7. [Build Application](#7-build-application)
8. [NGINX Setup](#8-nginx-setup)
9. [SSL Certificate (Let's Encrypt)](#9-ssl-certificate-lets-encrypt)
10. [Systemd Services](#10-systemd-services)
11. [Firewall Configuration](#11-firewall-configuration)
12. [Domain Setup](#12-domain-setup)
13. [Testing](#13-testing)
14. [Maintenance](#14-maintenance)

---

## 1. Google Cloud VM Setup

### Step 1.1: Create VM Instance

1. **Go to Google Cloud Console**
   - Navigate to: https://console.cloud.google.com/
   - Go to **Compute Engine** > **VM instances**

2. **Click "CREATE INSTANCE"**

3. **Configure VM:**
   ```
   Name: hamburg-parkfinder
   Region: europe-west3 (Frankfurt) - closest to Hamburg
   Zone: europe-west3-a

   Machine Configuration:
   - Series: E2
   - Machine type: e2-medium (2 vCPU, 4 GB memory)
     * For production: e2-standard-2 (2 vCPU, 8 GB memory)

   Boot Disk:
   - Operating System: Ubuntu
   - Version: Ubuntu 22.04 LTS (or latest)
   - Boot disk type: Balanced persistent disk
   - Size: 20 GB (minimum), 30 GB (recommended)

   Firewall:
   ✅ Allow HTTP traffic
   ✅ Allow HTTPS traffic
   ```

4. **Click "CREATE"**

5. **Note your External IP:**
   - You'll see the external IP in the VM instances list
   - Example: `34.159.123.45`

### Step 1.2: Set Static IP (Recommended)

1. Go to **VPC Network** > **IP Addresses**
2. Find your VM's external IP
3. Click the dropdown and select **"Reserve"**
4. Name it: `hamburg-parkfinder-ip`
5. Click **"Reserve"**

---

## 2. Initial Ubuntu Configuration

### Step 2.1: Connect to VM

**Option A: SSH from Google Cloud Console**
```bash
# Click "SSH" button in VM instances list
```

**Option B: SSH from Local Terminal**
```bash
# Replace with your external IP
gcloud compute ssh hamburg-parkfinder --zone=europe-west3-a

# Or use regular SSH
ssh -i ~/.ssh/google_compute_engine username@34.159.123.45
```

### Step 2.2: Update System

```bash
# Update package lists
sudo apt update

# Upgrade all packages
sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git build-essential unzip
```

### Step 2.3: Create Application User

```bash
# Create a dedicated user for the application
sudo adduser parkfinder --disabled-password --gecos ""

# Add to sudo group (optional, for deployment tasks)
sudo usermod -aG sudo parkfinder

# Switch to the new user
sudo su - parkfinder
```

---

## 3. Install Dependencies

### Step 3.1: Install Node.js (Latest LTS)

```bash
# Install Node.js 20.x LTS using NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x

# Install global npm packages
sudo npm install -g pm2 typescript tsx
```

### Step 3.2: Install PostgreSQL

```bash
# Install PostgreSQL 15
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Check status
sudo systemctl status postgresql
```

### Step 3.3: Install NGINX

```bash
# Install NGINX
sudo apt install -y nginx

# Start and enable NGINX
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### Step 3.4: Install Certbot (for SSL)

```bash
# Install Certbot for Let's Encrypt SSL
sudo apt install -y certbot python3-certbot-nginx
```

---

## 4. Clone and Setup Application

### Step 4.1: Setup SSH Key for GitHub (if private repo)

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "parkfinder@hamburg.de"

# Display public key
cat ~/.ssh/id_ed25519.pub

# Copy the output and add to GitHub:
# GitHub > Settings > SSH and GPG keys > New SSH key
```

### Step 4.2: Clone Repository

```bash
# Navigate to home directory
cd ~

# Clone the repository
git clone git@github.com:MavrickRody/kirchDorfStreets.git
# OR if public:
# git clone https://github.com/MavrickRody/kirchDorfStreets.git

# Navigate to project
cd kirchDorfStreets

# Checkout the branch
git checkout claude/parking-map-app-DxRjK
```

### Step 4.3: Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..
```

---

## 5. Database Setup (PostgreSQL)

### Step 5.1: Create Database and User

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL shell, run:
```

```sql
-- Create database
CREATE DATABASE parkfinder_db;

-- Create user with password
CREATE USER parkfinder_user WITH ENCRYPTED PASSWORD 'your_secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE parkfinder_db TO parkfinder_user;

-- Exit
\q
```

### Step 5.2: Install Database Schema (Future)

```bash
# When you add database migrations, run:
# cd backend
# npm run migrate
```

---

## 6. Environment Configuration

### Step 6.1: Create Backend Environment File

```bash
# Create .env file for backend
cd ~/kirchDorfStreets/backend
nano .env
```

Add the following:

```env
# Server Configuration
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=parkfinder_db
DB_USER=parkfinder_user
DB_PASSWORD=your_secure_password_here

# JWT Configuration
JWT_SECRET=your_very_secure_jwt_secret_key_change_this_in_production
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=https://your-domain.com

# App Configuration
APP_NAME=Hamburg ParkFinder
APP_URL=https://your-domain.com
```

Save and exit (Ctrl+X, Y, Enter)

### Step 6.2: Create Frontend Environment File

```bash
# Create .env file for frontend
cd ~/kirchDorfStreets/frontend
nano .env
```

Add the following:

```env
VITE_API_URL=https://your-domain.com/api
VITE_APP_NAME=Hamburg ParkFinder
```

Save and exit

### Step 6.3: Secure Environment Files

```bash
# Set proper permissions
chmod 600 ~/kirchDorfStreets/backend/.env
chmod 600 ~/kirchDorfStreets/frontend/.env
```

---

## 7. Build Application

### Step 7.1: Build Backend

```bash
cd ~/kirchDorfStreets/backend
npm run build

# Test the build
node dist/server.js
# Press Ctrl+C to stop
```

### Step 7.2: Build Frontend

```bash
cd ~/kirchDorfStreets/frontend
npm run build

# This creates a 'dist' folder with static files
ls -la dist/
```

---

## 8. NGINX Setup

### Step 8.1: Create NGINX Configuration

```bash
# Create NGINX config file
sudo nano /etc/nginx/sites-available/parkfinder
```

Add the following configuration:

```nginx
# Frontend server (serves React app)
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS (will be configured after SSL setup)
    # return 301 https://$server_name$request_uri;

    root /home/parkfinder/kirchDorfStreets/frontend/dist;
    index index.html;

    # Frontend routes (React Router)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy to backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Access and error logs
    access_log /var/log/nginx/parkfinder_access.log;
    error_log /var/log/nginx/parkfinder_error.log;
}
```

Save and exit.

### Step 8.2: Enable Site

```bash
# Create symbolic link to enable site
sudo ln -s /etc/nginx/sites-available/parkfinder /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test NGINX configuration
sudo nginx -t

# If test is successful, reload NGINX
sudo systemctl reload nginx
```

---

## 9. SSL Certificate (Let's Encrypt)

### Step 9.1: Setup DNS First

**Before running Certbot, ensure:**
1. Your domain DNS A record points to your VM's external IP
2. Wait for DNS propagation (can take 5-60 minutes)
3. Test with: `ping your-domain.com`

### Step 9.2: Obtain SSL Certificate

```bash
# Run Certbot for NGINX
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Follow the prompts:
# - Enter email address
# - Agree to terms
# - Choose whether to redirect HTTP to HTTPS (recommended: Yes)

# Certbot will automatically:
# - Obtain certificate
# - Update NGINX configuration
# - Enable HTTPS redirect
```

### Step 9.3: Auto-Renewal Setup

```bash
# Test auto-renewal
sudo certbot renew --dry-run

# Certbot creates a systemd timer for auto-renewal
# Check status:
sudo systemctl status certbot.timer

# Certificate will auto-renew every 60 days
```

---

## 10. Systemd Services

### Step 10.1: Create Backend Service

```bash
# Create systemd service file
sudo nano /etc/systemd/system/parkfinder-backend.service
```

Add the following:

```ini
[Unit]
Description=Hamburg ParkFinder Backend API
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=parkfinder
WorkingDirectory=/home/parkfinder/kirchDorfStreets/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=parkfinder-backend

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=read-only
ReadWritePaths=/home/parkfinder/kirchDorfStreets

[Install]
WantedBy=multi-user.target
```

Save and exit.

### Step 10.2: Enable and Start Backend Service

```bash
# Reload systemd daemon
sudo systemctl daemon-reload

# Enable service (start on boot)
sudo systemctl enable parkfinder-backend

# Start service
sudo systemctl start parkfinder-backend

# Check status
sudo systemctl status parkfinder-backend

# View logs
sudo journalctl -u parkfinder-backend -f
```

### Step 10.3: Alternative - Use PM2 (Recommended for easier management)

```bash
# Start backend with PM2
cd ~/kirchDorfStreets/backend
pm2 start dist/server.js --name parkfinder-backend

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd -u parkfinder --hp /home/parkfinder

# Run the command that PM2 outputs (it will be a sudo command)

# Check status
pm2 status
pm2 logs parkfinder-backend
```

---

## 11. Firewall Configuration

### Step 11.1: Configure UFW (Ubuntu Firewall)

```bash
# Enable UFW
sudo ufw enable

# Allow SSH (IMPORTANT - do this first!)
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Allow PostgreSQL only from localhost (optional)
# sudo ufw allow from 127.0.0.1 to any port 5432

# Check status
sudo ufw status

# Check detailed rules
sudo ufw status numbered
```

### Step 11.2: Google Cloud Firewall Rules

The firewall rules should already be configured when you created the VM with "Allow HTTP/HTTPS traffic". Verify in Google Cloud Console:

1. Go to **VPC Network** > **Firewall**
2. Ensure these rules exist:
   - `default-allow-http` (tcp:80)
   - `default-allow-https` (tcp:443)

---

## 12. Domain Setup

### Step 12.1: Purchase Domain (if not already done)

Options:
- Google Domains
- Namecheap
- GoDaddy
- Cloudflare

### Step 12.2: Configure DNS

Add these DNS records:

```
Type: A
Name: @
Value: YOUR_VM_EXTERNAL_IP
TTL: 3600

Type: A
Name: www
Value: YOUR_VM_EXTERNAL_IP
TTL: 3600
```

### Step 12.3: Wait for DNS Propagation

```bash
# Check DNS propagation
dig your-domain.com
nslookup your-domain.com

# Or use online tool:
# https://dnschecker.org/
```

---

## 13. Testing

### Step 13.1: Test Backend API

```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Should return: {"status":"ok","message":"Hamburg ParkFinder API is running"}
```

### Step 13.2: Test NGINX

```bash
# Test NGINX config
sudo nginx -t

# Check NGINX status
sudo systemctl status nginx

# View NGINX error logs
sudo tail -f /var/log/nginx/parkfinder_error.log
```

### Step 13.3: Test Frontend

```bash
# Visit in browser:
https://your-domain.com

# Should load the Hamburg ParkFinder login page
```

### Step 13.4: Test Full Flow

1. **Login** - Enter username and password
2. **View Map** - See parking spots on map
3. **Click Marker** - View parking spot details
4. **Park** - Click "Hier parken" button
5. **Check Points** - Verify points increased
6. **Leave** - Click "Verlassen" button
7. **Upload GeoJSON** - Test file upload

---

## 14. Maintenance

### Step 14.1: View Logs

```bash
# Backend logs (systemd)
sudo journalctl -u parkfinder-backend -f

# Backend logs (PM2)
pm2 logs parkfinder-backend

# NGINX access logs
sudo tail -f /var/log/nginx/parkfinder_access.log

# NGINX error logs
sudo tail -f /var/log/nginx/parkfinder_error.log

# System logs
sudo journalctl -xe
```

### Step 14.2: Restart Services

```bash
# Restart backend (systemd)
sudo systemctl restart parkfinder-backend

# Restart backend (PM2)
pm2 restart parkfinder-backend

# Restart NGINX
sudo systemctl restart nginx

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Step 14.3: Update Application

```bash
# Navigate to project
cd ~/kirchDorfStreets

# Pull latest changes
git pull origin claude/parking-map-app-DxRjK

# Install new dependencies (if any)
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Rebuild backend
cd backend
npm run build

# Rebuild frontend
cd ../frontend
npm run build

# Restart backend service
pm2 restart parkfinder-backend
# OR: sudo systemctl restart parkfinder-backend

# No need to restart NGINX (frontend is static)
```

### Step 14.4: Backup Database

```bash
# Create backup directory
mkdir -p ~/backups

# Backup database
pg_dump -U parkfinder_user -h localhost parkfinder_db > ~/backups/parkfinder_$(date +%Y%m%d_%H%M%S).sql

# Setup automatic daily backups (crontab)
crontab -e

# Add this line:
# 0 2 * * * pg_dump -U parkfinder_user -h localhost parkfinder_db > ~/backups/parkfinder_$(date +\%Y\%m\%d_\%H\%M\%S).sql
```

### Step 14.5: Monitor System

```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check CPU usage
top

# Check running processes
ps aux | grep node
ps aux | grep nginx

# PM2 monitoring
pm2 monit
```

### Step 14.6: Security Updates

```bash
# Update system packages regularly
sudo apt update
sudo apt upgrade -y

# Setup automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

---

## 🎉 Deployment Complete!

Your Hamburg ParkFinder app should now be live at:
- **Frontend:** https://your-domain.com
- **Backend API:** https://your-domain.com/api

## 📊 Quick Reference Commands

```bash
# Check all services
sudo systemctl status parkfinder-backend nginx postgresql

# View all logs
pm2 logs
sudo tail -f /var/log/nginx/parkfinder_error.log

# Restart everything
pm2 restart parkfinder-backend
sudo systemctl restart nginx

# Update app
cd ~/kirchDorfStreets && git pull && cd backend && npm run build && pm2 restart parkfinder-backend && cd ../frontend && npm run build
```

## 🆘 Troubleshooting

### Backend won't start
```bash
# Check logs
sudo journalctl -u parkfinder-backend -n 50
pm2 logs parkfinder-backend --lines 50

# Check if port is in use
sudo lsof -i :5000

# Check environment variables
cat ~/kirchDorfStreets/backend/.env
```

### Frontend shows blank page
```bash
# Check NGINX error logs
sudo tail -f /var/log/nginx/parkfinder_error.log

# Verify build files exist
ls -la ~/kirchDorfStreets/frontend/dist/

# Check NGINX config
sudo nginx -t

# Rebuild frontend
cd ~/kirchDorfStreets/frontend && npm run build
```

### SSL certificate issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew --force-renewal

# Check NGINX SSL config
sudo nano /etc/nginx/sites-available/parkfinder
```

### Database connection issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test database connection
psql -U parkfinder_user -h localhost -d parkfinder_db

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

---

**Need help?** Open an issue on GitHub or contact support.

**Made with ❤️ for Hamburg's Kirchdorf-Süd neighborhood**
