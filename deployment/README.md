# Deployment Guide for taylorlearns.com

This guide explains the deployment architecture and how to set up both local development and production environments.

## Architecture Overview

### Local Development
- **Purpose**: Fully self-contained development environment
- **File**: `docker-compose.yml` in repository root
- **Components**: Django + its own PostgreSQL instance
- **Network**: Local bridge network
- **How to use**: `docker compose up` in the repository

### Production (VPS)
- **Purpose**: Multi-app production environment
- **File**: `/home/tschaack/app-stack/docker-compose.yml` on server
- **Components**:
  - Django (pulls pre-built image from GitHub Container Registry)
  - PostgreSQL (shared across all apps)
  - Nginx Proxy Manager (reverse proxy with SSL)
  - n8n (workflow automation)
  - OpenWebUI (AI interface)
- **Image Source**: `ghcr.io/bluestemso/taylor_learns_dot_com:latest`
- **Deployment**: Automatic via GitHub Actions on push to `main`

---

## Local Development Setup

### 1. Prerequisites
- Docker and Docker Compose installed
- Git

### 2. Clone and Configure

```bash
# Clone the repository
git clone https://github.com/bluestemso/taylor_learns_dot_com.git
cd taylor_learns_dot_com

# Create environment file
cp .env.example .env

# Edit .env and set required variables:
# - DB_PASSWORD (any password for local development)
# - DJANGO_SECRET (generate with: python -c "import secrets; print(secrets.token_urlsafe(50))")
nano .env
```

### 3. Start Development Environment

```bash
# Start all services (Django + PostgreSQL)
docker compose up -d

# Run initial migrations
docker compose exec django uv run python manage.py migrate

# Create a superuser (optional)
docker compose exec django uv run python manage.py createsuperuser

# Access the site
open http://localhost:8000
```

### 4. Development Commands

```bash
# View logs
docker compose logs -f django

# Run migrations after model changes
docker compose exec django uv run python manage.py makemigrations
docker compose exec django uv run python manage.py migrate

# Access Django shell
docker compose exec django uv run python manage.py shell

# Run tests
docker compose exec django uv run python manage.py test

# Restart Django
docker compose restart django

# Stop all services
docker compose down
```

---

## Production Server Setup

### Initial Server Setup (One-Time)

#### 1. Update Server's docker-compose.yml

Your server's docker-compose file at `/home/tschaack/app-stack/docker-compose.yml` should use the template from `deployment/docker-compose.server.yml`.

Key differences from local setup:
- Django service uses `image: ghcr.io/bluestemso/taylor_learns_dot_com:latest` (pre-built)
- Shares PostgreSQL with other apps
- Connected to Nginx Proxy Manager network

#### 2. Create Production Environment File

On your server:

```bash
cd /home/tschaack/app-stack
nano .env
```

Use `deployment/.env.server.example` as a template. Required variables:

```bash
# Generate secure values:
DB_PASSWORD=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
DJANGO_SECRET=$(python3 -c "import secrets; print(secrets.token_urlsafe(50))")

# Required settings
DJANGO_DEBUG=False
ALLOWED_HOSTS=taylorlearns.com,www.taylorlearns.com
CSRF_TRUSTED_ORIGINS=https://taylorlearns.com,https://www.taylorlearns.com
```

#### 3. Configure GitHub Container Registry Access

Make the GitHub Container Registry package public, OR configure server authentication:

**Option A: Make Package Public (Easiest)**
1. Go to https://github.com/users/bluestemso/packages/container/taylor_learns_dot_com/settings
2. Change visibility to "Public"

**Option B: Authenticate Server (Private Packages)**
```bash
# On your VPS
echo $GITHUB_TOKEN | docker login ghcr.io -u bluestemso --password-stdin
```

#### 4. Start Services

```bash
cd /home/tschaack/app-stack

# Pull the latest image
docker pull ghcr.io/bluestemso/taylor_learns_dot_com:latest

# Start all services
docker compose up -d

# Run initial migrations
docker compose exec django uv run python manage.py migrate

# Check status
docker compose ps
docker compose logs django
```

#### 5. Configure Nginx Proxy Manager

1. Access at `http://your-vps-ip:81`
2. Login (default: `admin@example.com` / `changeme`)
3. Add Proxy Host:
   - **Domains**: `taylorlearns.com`, `www.taylorlearns.com`
   - **Scheme**: `http`
   - **Forward Hostname**: `django`
   - **Forward Port**: `8000`
   - **SSL**: Request Let's Encrypt certificate
   - **Force SSL**: Enabled
   - **HTTP/2**: Enabled

---

## GitHub Actions CI/CD

### How It Works

The `.github/workflows/deploy.yml` workflow automates deployment:

**On push to `main` branch:**
1. **Build Job**:
   - Builds Docker image with your latest code
   - Pushes to GitHub Container Registry (ghcr.io)
   - Tags: `latest`, `main-<sha>`, `main`

2. **Deploy Job** (runs after build):
   - Connects to VPS via SSH
   - Pulls new image from registry
   - Recreates Django container
   - Runs database migrations
   - Performs health check

### Required GitHub Secrets

Configure in GitHub repository Settings → Secrets and variables → Actions:

| Secret | Description | Example |
|--------|-------------|---------|
| `SSH_PRIVATE_KEY` | Private SSH key for server access | `-----BEGIN OPENSSH PRIVATE KEY-----\n...` |
| `VPS_HOST` | Server IP address | `65.109.139.248` |
| `VPS_USER` | Server username | `tschaack` |
| `VPS_APP_DIR` | App stack directory path | `/home/tschaack/app-stack` |

**Note**: `GITHUB_TOKEN` is automatically provided by GitHub Actions.

### Setting Up SSH Key

```bash
# On your local machine:
# 1. Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "github-actions-deploy"

# 2. Copy public key to server
ssh-copy-id -i ~/.ssh/id_ed25519.pub tschaack@65.109.139.248

# 3. Test connection
ssh -i ~/.ssh/id_ed25519 tschaack@65.109.139.248

# 4. Add private key to GitHub Secrets
cat ~/.ssh/id_ed25519
# Copy the entire output including BEGIN/END lines
```

### Making GitHub Packages Public

For the workflow to work without additional authentication:

1. Go to https://github.com/bluestemso?tab=packages
2. Click on `taylor_learns_dot_com`
3. Package settings → Change visibility → Public
4. Confirm the change

---

## Development Workflow

### Standard Workflow

```bash
# 1. Develop locally
docker compose up -d
# Make your changes...

# 2. Test locally
docker compose exec django uv run python manage.py test
npm test  # Run Playwright tests

# 3. Commit and push
git add .
git commit -m "Your feature description"
git push origin main

# 4. GitHub Actions automatically:
#    - Builds Docker image
#    - Pushes to ghcr.io
#    - Deploys to production

# 5. Monitor deployment
# Check GitHub Actions tab for status
# Visit https://taylorlearns.com to verify
```

### Feature Branch Workflow

```bash
# 1. Create feature branch
git checkout -b feature/my-new-feature

# 2. Develop and test locally
docker compose up -d
# Make changes, test...

# 3. Push feature branch (won't deploy)
git push origin feature/my-new-feature

# 4. Create PR, review, merge to main
# Only then will deployment happen automatically
```

---

## Troubleshooting

### Local Development Issues

**Container won't start:**
```bash
# Check logs
docker compose logs django

# Rebuild from scratch
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

**Database connection failed:**
```bash
# Verify postgres is running
docker compose ps postgres

# Check postgres logs
docker compose logs postgres

# Verify DATABASE_URL in container
docker compose exec django env | grep DATABASE_URL
```

### Production Deployment Issues

**GitHub Actions build fails:**
- Check the Actions tab for detailed error logs
- Verify `deployment/Dockerfile` builds locally: `docker build -f deployment/Dockerfile .`
- Ensure `uv.lock` is committed to repository

**Image pull fails on server:**
```bash
# Check if image exists in registry
docker pull ghcr.io/bluestemso/taylor_learns_dot_com:latest

# Verify package visibility (should be public or server authenticated)
# If private, authenticate: echo $TOKEN | docker login ghcr.io -u bluestemso --password-stdin
```

**Container starts but site is down:**
```bash
cd /home/tschaack/app-stack

# Check container status
docker compose ps django

# View logs
docker compose logs django --tail=100

# Check environment variables
docker compose exec django env | grep -E 'DJANGO|DB_|ALLOWED'

# Test database connection
docker compose exec django uv run python manage.py check --database default

# Check nginx proxy manager routing
curl -H "Host: taylorlearns.com" http://localhost:8000
```

**Migrations fail:**
```bash
# Run migrations manually to see detailed errors
docker compose exec django uv run python manage.py migrate --verbosity 3

# If migrations are stuck, check migration files
docker compose exec django uv run python manage.py showmigrations

# Check database connectivity
docker compose exec postgres psql -U taylorlearns -d taylorlearnsblog -c "\dt"
```

**Health check fails:**
```bash
# Test from inside container
docker compose exec django curl -f http://localhost:8000/

# Check gunicorn is running
docker compose exec django ps aux | grep gunicorn

# Restart service
docker compose restart django
```

### Common Configuration Errors

**Missing environment variables:**
```bash
# Verify .env file exists
ls -la /home/tschaack/app-stack/.env

# Check required variables
grep -E 'DB_PASSWORD|DJANGO_SECRET' /home/tschaack/app-stack/.env

# If missing, generate secure values
python3 -c "import secrets; print('DB_PASSWORD=' + secrets.token_urlsafe(32))"
python3 -c "import secrets; print('DJANGO_SECRET=' + secrets.token_urlsafe(50))"
```

**Wrong docker-compose file:**
```bash
# Verify you're using the parent docker-compose.yml
cd /home/tschaack/app-stack
docker compose config | grep -A 5 django
# Should show: image: ghcr.io/bluestemso/taylor_learns_dot_com:latest
```

---

## Monitoring and Maintenance

### View Logs

```bash
# Production logs
ssh tschaack@65.109.139.248
cd /home/tschaack/app-stack
docker compose logs -f django

# Filter for errors
docker compose logs django | grep -i error

# Check all services
docker compose logs -f
```

### Database Backup

```bash
# Create backup
docker compose exec postgres pg_dump -U taylorlearns taylorlearnsblog > backup_$(date +%Y%m%d).sql

# Restore backup
docker compose exec -T postgres psql -U taylorlearns taylorlearnsblog < backup_20241111.sql
```

### Update Application

Application updates happen automatically via GitHub Actions. To manually update:

```bash
cd /home/tschaack/app-stack

# Pull latest image
docker pull ghcr.io/bluestemso/taylor_learns_dot_com:latest

# Recreate container
docker compose up -d --no-deps --force-recreate django

# Run migrations
docker compose exec django uv run python manage.py migrate
```

### Clean Up Docker

```bash
# Remove unused images (frees disk space)
docker image prune -a

# Remove old containers
docker container prune

# Check disk usage
docker system df
```

---

## Security Best Practices

1. **Environment Variables**:
   - Never commit `.env` files
   - Use strong, unique secrets for production
   - Rotate secrets periodically

2. **Django Settings**:
   - `DJANGO_DEBUG=False` in production
   - Set proper `ALLOWED_HOSTS` and `CSRF_TRUSTED_ORIGINS`
   - Use `SESSION_COOKIE_SECURE=True` (HTTPS only)

3. **Database**:
   - Strong password (32+ characters)
   - Regular backups
   - Persistent volumes (don't use `docker-compose down -v` in production)

4. **SSH Access**:
   - Use SSH keys, not passwords
   - Restrict SSH access (fail2ban, firewall rules)
   - Keep private keys secure

5. **Docker Images**:
   - Images are public on ghcr.io (code is already public)
   - Secrets only in environment variables, never in images
   - Regularly update base images

6. **SSL/TLS**:
   - Always use HTTPS (handled by Nginx Proxy Manager)
   - Auto-renewing Let's Encrypt certificates
   - Force HTTPS redirects

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     LOCAL DEVELOPMENT                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  docker-compose.yml (repo root)                              │
│  ├── django (build from Dockerfile)                          │
│  └── postgres:15 (local instance)                            │
│                                                               │
│  Network: bridge (local)                                     │
│  Access: http://localhost:8000                               │
│                                                               │
└─────────────────────────────────────────────────────────────┘

                            │
                            │ git push origin main
                            ▼

┌─────────────────────────────────────────────────────────────┐
│                     GITHUB ACTIONS                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Build Job:                                                  │
│  1. docker build -f deployment/Dockerfile                    │
│  2. docker push ghcr.io/bluestemso/taylor_learns_dot_com       │
│                                                               │
│  Deploy Job:                                                 │
│  1. SSH to VPS                                               │
│  2. docker pull ghcr.io/bluestemso/taylor_learns_dot_com       │
│  3. docker compose up -d --force-recreate django             │
│  4. Run migrations                                           │
│                                                               │
└─────────────────────────────────────────────────────────────┘

                            │
                            │ deploys to
                            ▼

┌─────────────────────────────────────────────────────────────┐
│                  PRODUCTION (Hetzner VPS)                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  /home/tschaack/app-stack/docker-compose.yml                 │
│  ├── nginx-proxy-manager (ports 80, 443)                     │
│  ├── postgres:16 (shared database)                           │
│  ├── django (image: ghcr.io/.../taylor_learns_dot_com)       │
│  ├── n8n (workflow automation)                               │
│  └── open-webui (AI interface)                               │
│                                                               │
│  Network: app-network (bridge)                               │
│  Access: https://taylorlearns.com (via NPM proxy)            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Support and Additional Resources

- **Project README**: `/README.md`
- **Frontend Design Guide**: `/FRONTEND_DESIGN_GUIDE.md`
- **Testing Documentation**: `/tests/README.md`
- **GitHub Repository**: https://github.com/bluestemso/taylor_learns_dot_com

For issues:
1. Check container logs (`docker compose logs`)
2. Verify environment variables
3. Review GitHub Actions logs
4. Test database connectivity
5. Check Nginx Proxy Manager configuration
