#!/bin/bash
# Manual deployment script for taylorlearns.com
# This script can be run from your local machine to deploy to the server
#
# Usage: ./deployment/deploy.sh
#
# Requirements:
# - SSH access to the server
# - SSH key configured in ~/.ssh/config or use environment variables
# - Server must have Docker with compose plugin installed

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration (can be overridden by environment variables)
VPS_HOST="${VPS_HOST:-65.109.139.248}"
VPS_USER="${VPS_USER:-tschaack}"
APP_STACK_DIR="${APP_STACK_DIR:-/home/tschaack/app-stack}"
APP_DIR="$APP_STACK_DIR/taylor_learns_dot_com"

echo -e "${GREEN}=========================================="
echo "taylorlearns.com Deployment Script"
echo "==========================================${NC}"
echo ""
echo "Server: $VPS_USER@$VPS_HOST"
echo "App Stack Directory: $APP_STACK_DIR"
echo "App Directory: $APP_DIR"
echo ""

# Check if SSH key is available
if [ -z "$SSH_PRIVATE_KEY" ] && [ ! -f "$HOME/.ssh/id_rsa" ] && [ ! -f "$HOME/.ssh/id_ed25519" ]; then
    echo -e "${YELLOW}Warning: No SSH key found. You may need to configure SSH access.${NC}"
    echo "You can set SSH_PRIVATE_KEY environment variable or configure ~/.ssh/config"
    echo ""
fi

# Deploy function
deploy() {
    echo -e "${YELLOW}Connecting to server and deploying...${NC}"
    echo ""
    
    ssh $VPS_USER@$VPS_HOST "APP_STACK_DIR='$APP_STACK_DIR' APP_DIR='$APP_DIR' bash -s" << 'ENDSSH'
        set -e
        
        echo "=========================================="
        echo "Starting deployment..."
        echo "=========================================="
        echo ""
        
        # Navigate to app stack directory
        cd "$APP_STACK_DIR" || {
            echo "Error: Could not find app stack directory: $APP_STACK_DIR"
            exit 1
        }
        
        # Pull latest code
        echo "Step 1: Pulling latest code..."
        cd "$APP_DIR" || {
            echo "Error: Could not find app directory: $APP_DIR"
            exit 1
        }
        git pull origin main || {
            echo "Error: Failed to pull latest code"
            exit 1
        }
        cd "$APP_STACK_DIR"
        echo "✓ Code pulled successfully"
        echo ""
        
        # Build Docker image
        echo "Step 2: Building Docker image..."
        docker compose build django || {
            echo "Error: Failed to build Docker image"
            exit 1
        }
        echo "✓ Docker image built successfully"
        echo ""
        
        # Run migrations
        echo "Step 3: Running database migrations..."
        docker compose exec -T django python manage.py migrate --noinput || {
            echo "Error: Failed to run migrations"
            exit 1
        }
        echo "✓ Migrations completed successfully"
        echo ""
        
        # Collect static files
        echo "Step 4: Collecting static files..."
        docker compose exec -T django python manage.py collectstatic --noinput || {
            echo "Error: Failed to collect static files"
            exit 1
        }
        echo "✓ Static files collected successfully"
        echo ""
        
        # Restart Django service
        echo "Step 5: Restarting Django service..."
        docker compose restart django || {
            echo "Error: Failed to restart Django service"
            exit 1
        }
        echo "✓ Django service restarted successfully"
        echo ""
        
        # Check service status
        echo "Step 6: Checking service status..."
        docker compose ps django
        echo ""
        
        echo "=========================================="
        echo "Deployment complete!"
        echo "=========================================="
ENDSSH

    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✓ Deployment completed successfully!${NC}"
        echo ""
        echo "You can check the application at: https://taylorlearns.com"
    else
        echo ""
        echo -e "${RED}✗ Deployment failed!${NC}"
        exit 1
    fi
}

# Health check function
health_check() {
    echo ""
    echo -e "${YELLOW}Performing health check...${NC}"
    sleep 5
    
    if curl -f -s https://taylorlearns.com > /dev/null; then
        echo -e "${GREEN}✓ Health check passed!${NC}"
    else
        echo -e "${YELLOW}⚠ Health check failed, but deployment may still be successful${NC}"
        echo "The service might need a few more seconds to start up."
    fi
}

# Main execution
main() {
    # Confirm deployment
    echo -e "${YELLOW}This will deploy to production. Continue? (y/N)${NC}"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 0
    fi
    
    echo ""
    deploy
    health_check
}

# Run main function
main


