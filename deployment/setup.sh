#!/bin/bash
# Initial server setup script for taylorlearns.com
# This script should be run as root or with sudo
#
# Usage: sudo bash deployment/setup.sh

set -e  # Exit on error

echo "=========================================="
echo "taylorlearns.com Server Setup"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root or with sudo${NC}"
    exit 1
fi

# Variables
DEPLOY_USER="taylorlearns"
APP_DIR="/home/$DEPLOY_USER/taylor_learns_dot_com"
ENV_FILE="/etc/taylorlearns.env"
DB_NAME="taylorlearnsblog"
DB_USER="taylorlearns"

# Step 1: Create deployment user
echo -e "\n${YELLOW}Step 1: Creating deployment user...${NC}"
if id "$DEPLOY_USER" &>/dev/null; then
    echo "User $DEPLOY_USER already exists"
else
    useradd -m -s /bin/bash "$DEPLOY_USER"
    echo "User $DEPLOY_USER created"
fi

# Step 2: Install system dependencies
echo -e "\n${YELLOW}Step 2: Installing system dependencies...${NC}"
apt-get update
apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    postgresql \
    postgresql-contrib \
    nginx \
    certbot \
    python3-certbot-nginx \
    git \
    curl \
    build-essential \
    libpq-dev

# Step 3: Install uv (Python package manager)
echo -e "\n${YELLOW}Step 3: Installing uv...${NC}"
if ! command -v uv &> /dev/null; then
    curl -LsSf https://astral.sh/uv/install.sh | sh
    # Add uv to PATH for root
    export PATH="$HOME/.cargo/bin:$PATH"
    # Also add to deployment user's PATH
    sudo -u "$DEPLOY_USER" bash -c 'export PATH="$HOME/.cargo/bin:$PATH"'
else
    echo "uv is already installed"
fi

# Step 4: Set up PostgreSQL database
echo -e "\n${YELLOW}Step 4: Setting up PostgreSQL database...${NC}"
sudo -u postgres psql -c "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD 'temp_password_change_me';"

sudo -u postgres psql -c "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

sudo -u postgres psql -c "ALTER DATABASE $DB_NAME SET timezone TO 'UTC';"

echo -e "${GREEN}Database created. ${RED}Please update the password in /etc/taylorlearns.env${NC}"

# Step 5: Create application directory
echo -e "\n${YELLOW}Step 5: Creating application directory...${NC}"
mkdir -p "$APP_DIR"
chown "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR"

# Step 6: Set up environment file
echo -e "\n${YELLOW}Step 6: Setting up environment file...${NC}"
if [ ! -f "$ENV_FILE" ]; then
    cp "$APP_DIR/deployment/env.example" "$ENV_FILE" 2>/dev/null || \
        echo "# Environment variables for taylorlearns.com" > "$ENV_FILE"
    chmod 600 "$ENV_FILE"
    chown root:root "$ENV_FILE"
    echo -e "${GREEN}Environment file created at $ENV_FILE${NC}"
    echo -e "${YELLOW}Please edit $ENV_FILE and fill in all required values${NC}"
else
    echo "Environment file already exists at $ENV_FILE"
fi

# Step 7: Create log directory
echo -e "\n${YELLOW}Step 7: Creating log directory...${NC}"
mkdir -p /var/log/taylorlearns
chown "$DEPLOY_USER:$DEPLOY_USER" /var/log/taylorlearns

# Step 8: Install systemd service
echo -e "\n${YELLOW}Step 8: Installing systemd service...${NC}"
if [ -f "$APP_DIR/deployment/gunicorn.service" ]; then
    cp "$APP_DIR/deployment/gunicorn.service" /etc/systemd/system/taylorlearns.service
    systemctl daemon-reload
    echo "Systemd service installed"
else
    echo -e "${YELLOW}Warning: gunicorn.service not found. Install after cloning repository.${NC}"
fi

# Step 9: Set up Nginx configuration
echo -e "\n${YELLOW}Step 9: Setting up Nginx configuration...${NC}"
if [ -f "$APP_DIR/deployment/nginx.conf" ]; then
    cp "$APP_DIR/deployment/nginx.conf" /etc/nginx/sites-available/taylorlearns.com
    if [ ! -L /etc/nginx/sites-enabled/taylorlearns.com ]; then
        ln -s /etc/nginx/sites-available/taylorlearns.com /etc/nginx/sites-enabled/
    fi
    echo "Nginx configuration installed"
    echo -e "${YELLOW}Test Nginx config with: nginx -t${NC}"
    echo -e "${YELLOW}Reload Nginx with: systemctl reload nginx${NC}"
else
    echo -e "${YELLOW}Warning: nginx.conf not found. Install after cloning repository.${NC}"
fi

# Step 10: SSL Certificate setup
echo -e "\n${YELLOW}Step 10: SSL Certificate setup...${NC}"
echo "Checking for existing SSL certificates..."
if [ -f "/etc/letsencrypt/live/taylorlearns.com/fullchain.pem" ]; then
    echo -e "${GREEN}SSL certificates already exist${NC}"
else
    echo -e "${YELLOW}SSL certificates not found.${NC}"
    echo "To set up Let's Encrypt SSL certificates, run:"
    echo "  sudo certbot --nginx -d taylorlearns.com -d www.taylorlearns.com"
    echo ""
    echo "Make sure DNS is pointing to this server before running certbot."
fi

# Step 11: Firewall setup (if ufw is installed)
echo -e "\n${YELLOW}Step 11: Firewall setup...${NC}"
if command -v ufw &> /dev/null; then
    echo "Checking firewall rules..."
    ufw allow 22/tcp comment 'SSH' 2>/dev/null || true
    ufw allow 80/tcp comment 'HTTP' 2>/dev/null || true
    ufw allow 443/tcp comment 'HTTPS' 2>/dev/null || true
    echo "Firewall rules configured"
else
    echo "ufw not installed, skipping firewall setup"
fi

echo -e "\n${GREEN}=========================================="
echo "Setup Complete!"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Edit $ENV_FILE and fill in all required values"
echo "2. Generate a Django secret key:"
echo "   python3 -c \"import secrets; print(secrets.token_urlsafe(50))\""
echo "3. Update database password in PostgreSQL:"
echo "   sudo -u postgres psql -c \"ALTER USER $DB_USER WITH PASSWORD 'your-password';\""
echo "4. Clone the repository to $APP_DIR (as $DEPLOY_USER):"
echo "   sudo -u $DEPLOY_USER git clone <your-repo-url> $APP_DIR"
echo "5. Install dependencies and set up the application (see deployment/README.md)"
echo "6. Set up SSL certificates (if not already done):"
echo "   sudo certbot --nginx -d taylorlearns.com -d www.taylorlearns.com"
echo "7. Start the service:"
echo "   sudo systemctl enable taylorlearns"
echo "   sudo systemctl start taylorlearns"
echo ""


