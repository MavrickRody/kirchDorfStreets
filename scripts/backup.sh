#!/bin/bash
#
# Hamburg ParkFinder - Database Backup Script
# This script creates a backup of the PostgreSQL database
#

set -e

echo "💾 Hamburg ParkFinder - Database Backup"
echo "========================================"
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

# Backup directory
BACKUP_DIR="$HOME/backups"
mkdir -p "$BACKUP_DIR"

# Timestamp for filename
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/parkfinder_$TIMESTAMP.sql"

# Load database credentials
if [ -f "$HOME/.db_credentials" ]; then
    source "$HOME/.db_credentials"
else
    print_error "Database credentials not found at ~/.db_credentials"
    echo ""
    print_info "Please enter database connection details:"
    read -p "Database name [parkfinder_db]: " DB_NAME
    DB_NAME=${DB_NAME:-parkfinder_db}

    read -p "Database user [parkfinder_user]: " DB_USER
    DB_USER=${DB_USER:-parkfinder_user}

    read -p "Database host [localhost]: " DB_HOST
    DB_HOST=${DB_HOST:-localhost}
fi

# Create backup
print_info "Creating database backup..."
print_info "Database: $DB_NAME"
print_info "User: $DB_USER"
print_info "Host: $DB_HOST"
echo ""

if PGPASSWORD=$DB_PASSWORD pg_dump -U $DB_USER -h $DB_HOST $DB_NAME > "$BACKUP_FILE"; then
    # Compress backup
    print_info "Compressing backup..."
    gzip "$BACKUP_FILE"
    BACKUP_FILE="$BACKUP_FILE.gz"

    # Get file size
    FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

    print_success "Backup created successfully!"
    echo ""
    echo "Backup location: $BACKUP_FILE"
    echo "Backup size: $FILE_SIZE"
else
    print_error "Backup failed!"
    exit 1
fi

# Clean up old backups (keep last 7 days)
print_info "Cleaning up old backups (keeping last 7 days)..."
find "$BACKUP_DIR" -name "parkfinder_*.sql.gz" -type f -mtime +7 -delete
REMAINING=$(find "$BACKUP_DIR" -name "parkfinder_*.sql.gz" -type f | wc -l)
print_success "Cleanup complete. $REMAINING backups remaining."

echo ""
echo "========================================"
echo "💾 Backup Complete!"
echo "========================================"
echo ""
echo "Backup file: $BACKUP_FILE"
echo "Backup size: $FILE_SIZE"
echo ""
echo "To restore this backup:"
echo "  gunzip -c $BACKUP_FILE | psql -U $DB_USER -h $DB_HOST $DB_NAME"
echo ""
print_info "Setup automatic daily backups with cron:"
echo "  crontab -e"
echo "  # Add: 0 2 * * * $PWD/backup.sh >> ~/logs/backup.log 2>&1"
echo ""
