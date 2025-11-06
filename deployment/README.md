# Deployment Guide for taylorlearns.com

This guide explains how to deploy the taylorlearns.com Django blog to a Hetzner VPS using Docker Compose with Nginx Proxy Manager.

## Current Server Setup

Your server uses:
- **Docker Compose** for service orchestration
- **Nginx Proxy Manager** (running in Docker) for reverse proxy
- **Docker network**: `app-stack_app-network`
- **Existing services**: n8n, OpenWebUI
- **Ports**: 80, 443 (NPM), 8080 (open-webui)

## Deployment Options

You have two deployment options:

1. **Docker Deployment** (Recommended) - Run Django in Docker alongside your other services
2. **Host Deployment** - Run Django directly on the host with systemd

This guide covers both options.

---

## Option 1: Docker Deployment (Recommended)

### 1. Clone the Repository

```bash
cd ~/app-stack
git clone <your-repo-url> taylor_learns_dot_com
cd taylor_learns_dot_com
```

### 2. Add Services to docker-compose.yml

You can either:
- **A)** Add the services to your existing `~/app-stack/docker-compose.yml`
- **B)** Create a separate stack for the blog

**Option A: Add to existing docker-compose.yml**

```bash
cd ~/app-stack
# Copy the services from deployment/docker-compose.yml
# Add them to your existing docker-compose.yml
```

**Option B: Create separate stack**

```bash
cd ~/app-stack
mkdir taylorlearns
cd taylorlearns
cp ../taylor_learns_dot_com/deployment/docker-compose.yml .
cp ../taylor_learns_dot_com/deployment/Dockerfile .
cp ../taylor_learns_dot_com/deployment/.dockerignore .
```

### 3. Create Environment File

Create a `.env` file in the same directory as `docker-compose.yml`:

```bash
cat > .env << EOF
# Database Configuration
DB_NAME=taylorlearnsblog
DB_USER=taylorlearns
DB_PASSWORD=your-secure-password-here

# Django Configuration
DJANGO_SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(50))")
DJANGO_DEBUG=False
ALLOWED_HOSTS=taylorlearns.com,www.taylorlearns.com
CSRF_TRUSTED_ORIGINS=https://taylorlearns.com,https://www.taylorlearns.com

# Optional
CLOUDFLARE_EMAIL=your-email@example.com
CLOUDFLARE_TOKEN=your-token
CLOUDFLARE_ZONE_ID=your-zone-id
SENTRY_DSN=your-sentry-dsn
EOF
```

### 4. Build and Start Services

```bash
docker-compose up -d --build
```

### 5. Run Initial Migrations

```bash
docker-compose exec django python manage.py migrate
docker-compose exec django python manage.py collectstatic --noinput
```

### 6. Create Superuser (Optional)

```bash
docker-compose exec django python manage.py createsuperuser
```

### 7. Configure Nginx Proxy Manager

1. Access Nginx Proxy Manager at `http://your-vps-ip:81`
2. Login (default: `admin@example.com` / `changeme`)
3. Go to **Proxy Hosts** → **Add Proxy Host**
4. Configure:
   - **Domain Names**: `taylorlearns.com`, `www.taylorlearns.com`
   - **Scheme**: `http`
   - **Forward Hostname/IP**: `django` (or service name if separate stack)
   - **Forward Port**: `8000`
   - **SSL**: Enable SSL, request new certificate with Let's Encrypt
   - **Advanced**: Add custom headers if needed

### 8. Verify Deployment

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f django
docker-compose logs -f postgres

# Test the application
curl http://localhost:8000
```

### 9. Update Deployment

```bash
cd ~/app-stack/taylor_learns_dot_com  # or your repo location
git pull origin main
docker-compose build django
docker-compose exec django python manage.py migrate --noinput
docker-compose exec django python manage.py collectstatic --noinput
docker-compose restart django
```

---

## Option 2: Host Deployment (Alternative)

If you prefer to run Django directly on the host instead of Docker:

### 1. Install System Dependencies

```bash
sudo apt-get update
sudo apt-get install -y python3 python3-pip python3-venv postgresql postgresql-contrib curl build-essential libpq-dev
```

### 2. Install uv

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
export PATH="$HOME/.cargo/bin:$PATH"
```

### 3. Set Up PostgreSQL

```bash
sudo -u postgres psql << EOF
CREATE USER taylorlearns WITH PASSWORD 'your-secure-password';
CREATE DATABASE taylorlearnsblog OWNER taylorlearns;
ALTER DATABASE taylorlearnsblog SET timezone TO 'UTC';
EOF
```

### 4. Clone Repository

```bash
cd ~
git clone <your-repo-url> taylor_learns_dot_com
cd taylor_learns_dot_com
```

### 5. Install Dependencies

```bash
export PATH="$HOME/.cargo/bin:$PATH"
uv sync
```

### 6. Configure Environment

```bash
cat > .env << EOF
DATABASE_URL=postgresql://taylorlearns:your-password@localhost:5432/taylorlearnsblog
DJANGO_SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(50))")
DJANGO_DEBUG=False
ALLOWED_HOSTS=taylorlearns.com,www.taylorlearns.com
CSRF_TRUSTED_ORIGINS=https://taylorlearns.com,https://www.taylorlearns.com
EOF

source .venv/bin/activate
python manage.py migrate
python manage.py collectstatic --noinput
```

### 7. Set Up systemd Service

```bash
sudo cp deployment/gunicorn.service /etc/systemd/system/taylorlearns.service
sudo systemctl daemon-reload
sudo systemctl enable taylorlearns
sudo systemctl start taylorlearns
```

### 8. Configure Nginx Proxy Manager

1. Access NPM at `http://your-vps-ip:81`
2. Add Proxy Host:
   - **Domain Names**: `taylorlearns.com`, `www.taylorlearns.com`
   - **Forward Hostname/IP**: `localhost` or `127.0.0.1`
   - **Forward Port**: `8000` (or your Gunicorn port)

### 9. Update Deployment

```bash
cd ~/taylor_learns_dot_com
git pull origin main
export PATH="$HOME/.cargo/bin:$PATH"
uv sync
source .venv/bin/activate
python manage.py migrate --noinput
python manage.py collectstatic --noinput
sudo systemctl restart taylorlearns
```

---

## GitHub Actions CI/CD

The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically deploys to your server when you push to the `main` branch.

### How It Works

1. **Automatic Deployment**: When you push to `main`, the workflow:
   - Connects to your server via SSH
   - Pulls the latest code from the repository
   - Builds the Docker image
   - Runs database migrations
   - Collects static files
   - Restarts the Django service

2. **Manual Trigger**: You can also manually trigger deployments from the GitHub Actions tab.

### Required GitHub Secrets

Configure these secrets in your GitHub repository settings (Settings → Secrets and variables → Actions):

- `SSH_PRIVATE_KEY`: Private SSH key for deployment (the private key that corresponds to a public key on your server)
- `VPS_HOST`: Your VPS IP address (e.g., `65.109.139.248`)
- `VPS_USER`: Your server username (e.g., `tschaack`)
- `VPS_APP_DIR`: Path to your app stack directory (e.g., `/home/tschaack/app-stack`)

### Setting Up SSH Key

1. Generate an SSH key pair if you don't have one:
   ```bash
   ssh-keygen -t ed25519 -C "github-actions"
   ```

2. Copy the public key to your server:
   ```bash
   ssh-copy-id -i ~/.ssh/id_ed25519.pub tschaack@65.109.139.248
   ```

3. Add the private key to GitHub Secrets:
   - Copy the private key: `cat ~/.ssh/id_ed25519`
   - Go to GitHub → Settings → Secrets → New repository secret
   - Name: `SSH_PRIVATE_KEY`
   - Value: Paste the entire private key (including `-----BEGIN` and `-----END` lines)

---

## Remote Development Workflow

You can develop and deploy the application from your local machine without needing to SSH into the server for routine deployments.

### Automated Deployment (Recommended)

**Workflow**: Develop locally → Push to GitHub → Automatic deployment

1. **Develop Locally**:
   ```bash
   # Make your changes locally
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **Automatic Deployment**:
   - GitHub Actions automatically detects the push
   - Deploys to your server
   - You can monitor progress in the GitHub Actions tab

3. **Verify Deployment**:
   - Check the GitHub Actions workflow status
   - Visit https://taylorlearns.com to verify changes

### Manual Deployment Script

For quick deployments without pushing to GitHub, use the manual deployment script:

**Usage**:
```bash
# From your local machine
cd /path/to/taylor_learns_dot_com
./deployment/deploy.sh
```

**Configuration**:
The script uses environment variables (with defaults):
- `VPS_HOST`: Server IP (default: `65.109.139.248`)
- `VPS_USER`: Server username (default: `tschaack`)
- `APP_STACK_DIR`: App stack directory (default: `/home/tschaack/app-stack`)

**Example with custom settings**:
```bash
VPS_HOST=your-server-ip VPS_USER=your-username ./deployment/deploy.sh
```

**What the script does**:
1. Connects to your server via SSH
2. Pulls latest code from the repository
3. Builds the Docker image
4. Runs database migrations
5. Collects static files
6. Restarts the Django service
7. Performs a health check

**Requirements**:
- SSH access to the server (SSH key configured)
- Server must have `docker-compose` installed
- Repository must be cloned on the server

### Development Workflow Tips

1. **Test Locally First**: Always test changes locally before pushing
2. **Use Feature Branches**: Create feature branches and test before merging to `main`
3. **Monitor Deployments**: Check GitHub Actions logs if deployment fails
4. **Database Migrations**: The workflow automatically runs migrations, but review them first
5. **Static Files**: Static files are automatically collected during deployment

### Troubleshooting Remote Deployment

**Deployment fails with SSH error**:
- Verify SSH key is correctly configured in GitHub Secrets
- Test SSH connection manually: `ssh tschaack@65.109.139.248`
- Ensure the public key is in `~/.ssh/authorized_keys` on the server

**Docker build fails**:
- Check Docker is running on the server: `docker ps`
- Verify `docker-compose.yml` is in the correct location
- Check server disk space: `df -h`

**Migrations fail**:
- Review migration files before pushing
- Check database connection in `.env` file
- Verify database container is running: `docker-compose ps postgres`

**Service won't restart**:
- Check container logs: `docker-compose logs django`
- Verify environment variables are set correctly
- Check for port conflicts: `docker-compose ps`

---

## Cloudflare DNS Configuration

### DNS Records

In Cloudflare dashboard, ensure you have:

- **Type**: A
- **Name**: `@` (or `taylorlearns.com`)
- **Content**: `65.109.139.248`
- **Proxy**: On (orange cloud) recommended

- **Type**: A
- **Name**: `www`
- **Content**: `65.109.139.248`
- **Proxy**: On

### SSL/TLS Settings

- **SSL/TLS encryption mode**: Full (strict) recommended
- Nginx Proxy Manager will handle Let's Encrypt certificates automatically
- Ensure DNS is pointing to your server before requesting certificates

---

## Service Management

### Docker Services

```bash
# View status
docker-compose ps

# View logs
docker-compose logs -f django
docker-compose logs -f postgres

# Restart service
docker-compose restart django

# Stop services
docker-compose stop

# Start services
docker-compose start

# Rebuild and restart
docker-compose up -d --build
```

### Host Services (systemd)

```bash
# View status
sudo systemctl status taylorlearns

# View logs
sudo journalctl -u taylorlearns -f

# Restart service
sudo systemctl restart taylorlearns
```

### Nginx Proxy Manager

Access at `http://your-vps-ip:81` to manage:
- Proxy hosts
- SSL certificates
- Access lists
- Redirection hosts

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs django

# Check container status
docker-compose ps

# Verify environment variables
docker-compose exec django env | grep DJANGO
```

### Database Connection Issues

```bash
# Test PostgreSQL connection
docker-compose exec postgres psql -U taylorlearns -d taylorlearnsblog

# Check database exists
docker-compose exec postgres psql -U taylorlearns -c "\l"

# View PostgreSQL logs
docker-compose logs postgres
```

### Static Files Not Loading

```bash
# Re-collect static files
docker-compose exec django python manage.py collectstatic --noinput

# Check static files volume
docker-compose exec django ls -la /app/staticfiles/
```

### Nginx Proxy Manager Issues

1. Check NPM container is running:
   ```bash
   docker ps | grep nginx-proxy-manager
   ```

2. Access NPM admin panel at `http://your-vps-ip:81`

3. Check proxy host configuration in NPM

4. Verify SSL certificate status in NPM

### Port Conflicts

If port 8000 is already in use, you can:

1. **Change Django port** in docker-compose.yml:
   ```yaml
   expose:
     - "8001"  # Change to different port
   ```

2. **Update NPM** to point to the new port

---

## Backup and Restore

### Database Backup

```bash
# Docker
docker-compose exec postgres pg_dump -U taylorlearns taylorlearnsblog > backup_$(date +%Y%m%d).sql

# Host
sudo -u postgres pg_dump taylorlearnsblog > backup_$(date +%Y%m%d).sql
```

### Database Restore

```bash
# Docker
docker-compose exec -T postgres psql -U taylorlearns taylorlearnsblog < backup_20240101.sql

# Host
sudo -u postgres psql taylorlearnsblog < backup_20240101.sql
```

### Volume Backup (Docker)

```bash
docker run --rm -v app-stack_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup_$(date +%Y%m%d).tar.gz /data
```

---

## Monitoring

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f django

# System logs (host deployment)
sudo journalctl -u taylorlearns -f
```

### Resource Usage

```bash
# Container stats
docker stats

# System resources
htop
df -h
```

---

## Security Best Practices

1. **Environment Variables**: Keep `.env` file secure, never commit to git
2. **Database Passwords**: Use strong, unique passwords
3. **Django Secret Key**: Generate a unique secret key for production
4. **Firewall**: Configure UFW if not already set up
5. **Regular Updates**: Keep Docker images and system packages updated
6. **SSL**: Always use HTTPS in production (handled by NPM)
7. **Backups**: Set up automated database backups

---

## Maintenance

### Update Application

```bash
cd ~/app-stack/taylor_learns_dot_com
git pull origin main
docker-compose build django
docker-compose exec django python manage.py migrate --noinput
docker-compose exec django python manage.py collectstatic --noinput
docker-compose restart django
```

### Update Dependencies

```bash
# Update pyproject.toml locally, then:
git pull origin main
docker-compose build --no-cache django
docker-compose restart django
```

### Clean Up Docker

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes (be careful!)
docker volume prune
```

---

## Support

For issues:
1. Check container/service logs
2. Verify environment variables
3. Test database connectivity
4. Check Nginx Proxy Manager configuration
5. Verify DNS and SSL certificate status
