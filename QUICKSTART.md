# ⚡ Quick Start Guide - Google Cloud VM Deployment

## 30-Minute Deployment to Production

This guide will get your Hamburg ParkFinder app running on Google Cloud VM in ~30 minutes.

---

## 📋 Prerequisites

- [ ] Google Cloud account with billing enabled
- [ ] Domain name (optional, but recommended)
- [ ] SSH client installed locally

---

## 🚀 Step-by-Step Deployment

### Step 1: Create Google Cloud VM (5 minutes)

1. **Go to Google Cloud Console**
   - https://console.cloud.google.com/compute/instances

2. **Click "CREATE INSTANCE"**

3. **Configure:**
   ```
   Name: hamburg-parkfinder
   Region: europe-west3 (Frankfurt)
   Machine: e2-medium (2 vCPU, 4 GB)
   Boot disk: Ubuntu 22.04 LTS, 30 GB
   Firewall: ✅ HTTP, ✅ HTTPS
   ```

4. **Click "CREATE"**

5. **Note your External IP** (e.g., `34.159.123.45`)

### Step 2: Connect to VM (1 minute)

Click the **SSH** button in the VM instance list, or use terminal:

```bash
gcloud compute ssh hamburg-parkfinder --zone=europe-west3-a
```

### Step 3: Run Setup Script (10 minutes)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Clone repository
git clone https://github.com/MavrickRody/kirchDorfStreets.git
cd kirchDorfStreets
git checkout claude/parking-map-app-DxRjK

# Run automated setup script
./scripts/setup-vm.sh
```

**What this does:**
- Installs Node.js 20.x, npm, PM2
- Installs PostgreSQL, NGINX, Certbot
- Creates database and user
- Configures firewall
- Saves credentials

**You'll be prompted for:**
- Database password (choose a strong one!)

### Step 4: Configure Environment (3 minutes)

**Create backend .env file:**

```bash
cd ~/kirchDorfStreets/backend
nano .env
```

Paste this and update values:

```env
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Use credentials from ~/.db_credentials
DB_HOST=localhost
DB_PORT=5432
DB_NAME=parkfinder_db
DB_USER=parkfinder_user
DB_PASSWORD=YOUR_DATABASE_PASSWORD_HERE

# Generate a random secure key!
JWT_SECRET=CHANGE_THIS_TO_RANDOM_SECURE_STRING_MIN_32_CHARS

CORS_ORIGIN=https://your-domain.com
```

**Create frontend .env file:**

```bash
cd ~/kirchDorfStreets/frontend
nano .env
```

Paste this and update domain:

```env
VITE_API_URL=https://your-domain.com/api
VITE_APP_NAME=Hamburg ParkFinder
```

**Save files:** Press `Ctrl+X`, then `Y`, then `Enter`

### Step 5: Deploy Application (5 minutes)

```bash
cd ~/kirchDorfStreets

# Build and deploy
./scripts/deploy.sh
```

**What this does:**
- Installs all dependencies
- Builds backend (TypeScript → JavaScript)
- Builds frontend (React → static files)
- Starts backend with PM2
- Displays status

### Step 6: Configure NGINX (2 minutes)

```bash
cd ~/kirchDorfStreets

# Setup NGINX
./scripts/setup-nginx.sh
# Enter your domain when prompted (or press Enter for IP)
```

**What this does:**
- Creates NGINX configuration
- Enables the site
- Configures reverse proxy for API
- Reloads NGINX

### Step 7: Setup Domain DNS (if using domain)

**In your domain registrar** (GoDaddy, Namecheap, etc.):

Add these DNS records:

```
Type: A
Name: @
Value: YOUR_VM_EXTERNAL_IP

Type: A
Name: www
Value: YOUR_VM_EXTERNAL_IP
```

**Wait 5-15 minutes** for DNS propagation.

Test with: `ping your-domain.com`

### Step 8: Setup SSL Certificate (2 minutes)

```bash
cd ~/kirchDorfStreets

# Setup SSL with Let's Encrypt
./scripts/setup-ssl.sh your-domain.com
# Enter your email when prompted
```

**What this does:**
- Obtains SSL certificate from Let's Encrypt
- Configures NGINX for HTTPS
- Enables HTTP → HTTPS redirect
- Sets up auto-renewal

---

## ✅ Verification

### Test Backend API

```bash
curl http://localhost:5000/api/health
# Should return: {"status":"ok","message":"Hamburg ParkFinder API is running"}
```

### Test Frontend

Open in browser:
- **With domain:** https://your-domain.com
- **Without domain:** http://YOUR_VM_IP

You should see the Hamburg ParkFinder login page!

### Check System Status

```bash
cd ~/kirchDorfStreets
./scripts/status.sh
```

This shows status of all services, logs, and system health.

---

## 🎯 Quick Reference

### Common Commands

```bash
# Check status
./scripts/status.sh

# View backend logs
pm2 logs parkfinder-backend

# View NGINX logs
sudo tail -f /var/log/nginx/parkfinder_error.log

# Restart backend
pm2 restart parkfinder-backend

# Restart NGINX
sudo systemctl restart nginx

# Deploy updates
./scripts/deploy.sh

# Backup database
./scripts/backup.sh
```

### Service Management

```bash
# Backend
pm2 start parkfinder-backend
pm2 stop parkfinder-backend
pm2 restart parkfinder-backend
pm2 logs parkfinder-backend

# NGINX
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl status nginx

# PostgreSQL
sudo systemctl start postgresql
sudo systemctl stop postgresql
sudo systemctl restart postgresql
sudo systemctl status postgresql
```

### File Locations

```
Application: ~/kirchDorfStreets/
Backend: ~/kirchDorfStreets/backend/
Frontend: ~/kirchDorfStreets/frontend/
NGINX Config: /etc/nginx/sites-available/parkfinder
Backend Logs: pm2 logs
NGINX Logs: /var/log/nginx/parkfinder_*.log
Database Backups: ~/backups/
SSL Certificates: /etc/letsencrypt/live/your-domain.com/
```

---

## 🔧 Troubleshooting

### Backend won't start

```bash
# Check logs
pm2 logs parkfinder-backend --lines 50

# Check if port 5000 is in use
sudo lsof -i :5000

# Verify environment variables
cat ~/kirchDorfStreets/backend/.env

# Rebuild and restart
cd ~/kirchDorfStreets/backend
npm run build
pm2 restart parkfinder-backend
```

### Frontend shows blank page

```bash
# Check NGINX logs
sudo tail -f /var/log/nginx/parkfinder_error.log

# Verify build exists
ls -la ~/kirchDorfStreets/frontend/dist/

# Rebuild frontend
cd ~/kirchDorfStreets/frontend
npm run build

# Test NGINX config
sudo nginx -t
sudo systemctl reload nginx
```

### Can't connect to database

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -U parkfinder_user -h localhost -d parkfinder_db

# View PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### SSL certificate issues

```bash
# Check certificates
sudo certbot certificates

# Renew manually
sudo certbot renew --force-renewal

# Check NGINX SSL config
sudo nano /etc/nginx/sites-available/parkfinder
```

### Website not accessible

```bash
# Check firewall
sudo ufw status

# Ensure ports are open
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check if NGINX is listening
sudo netstat -tulpn | grep nginx

# Check Google Cloud firewall rules
# Go to: VPC Network > Firewall in Google Console
```

---

## 📊 Monitoring

### Setup Automated Backups

```bash
# Edit crontab
crontab -e

# Add daily 2 AM backup
0 2 * * * ~/kirchDorfStreets/scripts/backup.sh >> ~/logs/backup.log 2>&1

# Add weekly status check
0 9 * * 1 ~/kirchDorfStreets/scripts/status.sh > ~/logs/status_$(date +\%Y\%m\%d).log
```

### Setup Email Alerts (Optional)

Install and configure `mailutils` for email notifications on errors.

### Monitor with PM2

```bash
# Real-time monitoring
pm2 monit

# Web dashboard
pm2 web
```

---

## 🔒 Security Checklist

- [x] UFW firewall enabled (SSH, HTTP, HTTPS only)
- [x] SSL/TLS certificate installed
- [x] Strong database password
- [x] JWT secret changed from default
- [x] NGINX security headers configured
- [ ] Setup fail2ban for SSH protection
- [ ] Setup database backups to remote storage
- [ ] Configure log rotation
- [ ] Setup monitoring/alerting

### Additional Security Steps

```bash
# Install fail2ban (prevents brute force SSH)
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Setup log rotation
sudo nano /etc/logrotate.d/parkfinder
# Add configuration for log rotation

# Regular updates
sudo apt update && sudo apt upgrade -y

# Setup unattended security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

---

## 🎉 You're Live!

Your Hamburg ParkFinder app is now running in production on Google Cloud!

**Application URLs:**
- Frontend: https://your-domain.com
- Backend API: https://your-domain.com/api

**Next Steps:**
1. Test all features (login, map, parking, GeoJSON upload)
2. Upload your actual parking GeoJSON data
3. Setup monitoring and alerts
4. Configure automated backups
5. Share with early users in Kirchdorf-Süd!

---

## 📚 Additional Resources

- **Full Deployment Guide:** See `DEPLOYMENT.md`
- **Application README:** See `README.md`
- **Google Cloud Docs:** https://cloud.google.com/compute/docs
- **NGINX Docs:** https://nginx.org/en/docs/
- **PM2 Docs:** https://pm2.keymetrics.io/docs/

---

**Made with ❤️ for Hamburg's Kirchdorf-Süd neighborhood**
