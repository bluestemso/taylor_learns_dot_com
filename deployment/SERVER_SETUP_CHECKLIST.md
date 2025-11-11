# Server Setup Checklist

This checklist walks you through setting up the production server to use the new deployment architecture.

## Current Status

✅ Your server has:
- Docker and Docker Compose installed
- Multi-app setup in `/home/tschaack/app-stack/`
- Nginx Proxy Manager running
- n8n and OpenWebUI services running
- Django container running (but using wrong configuration)

## What Needs to Change

❌ Problems identified:
1. Missing environment variables in `/home/tschaack/app-stack/.env`
2. Server's `docker-compose.yml` builds Django locally (should pull pre-built image)
3. GitHub Actions can't push Docker images yet (needs package to exist)

## Step-by-Step Fix

### Step 1: Populate Environment File

On your VPS, create/update `/home/tschaack/app-stack/.env`:

```bash
ssh tschaack@65.109.139.248
cd /home/tschaack/app-stack

# Generate secure values
DB_PASSWORD=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
DJANGO_SECRET=$(python3 -c "import secrets; print(secrets.token_urlsafe(50))")

# Create .env file
cat > .env << EOF
# === Database Configuration ===
DB_NAME=taylorlearnsblog
DB_USER=taylorlearns
DB_PASSWORD=$DB_PASSWORD

# === Django Configuration ===
DJANGO_SECRET=$DJANGO_SECRET
DJANGO_DEBUG=False
ALLOWED_HOSTS=taylorlearns.com,www.taylorlearns.com
CSRF_TRUSTED_ORIGINS=https://taylorlearns.com,https://www.taylorlearns.com

# === n8n Configuration ===
TZ=America/New_York
WEBHOOK_URL=https://n8n.taylorlearns.com
N8N_EDITOR_BASE_URL=https://n8n.taylorlearns.com
N8N_HOST=n8n.taylorlearns.com

# === OpenWebUI Configuration ===
OLLAMA_BASE_URL=https://ollama.com

# === Optional Services (leave empty if not using) ===
CLOUDFLARE_EMAIL=
CLOUDFLARE_TOKEN=
CLOUDFLARE_ZONE_ID=
SENTRY_DSN=
SCREENSHOT_SECRET=
EOF

# Verify file was created
cat .env
```

**Save these values somewhere secure!** You'll need `DB_PASSWORD` and `DJANGO_SECRET` if you ever need to recreate the environment.

### Step 2: Update Server's docker-compose.yml

The Django service in `/home/tschaack/app-stack/docker-compose.yml` should be changed from:

```yaml
# BEFORE (builds locally)
django:
  build:
    context: ./taylor_learns_dot_com
    dockerfile: deployment/Dockerfile
  restart: unless-stopped
  # ... rest of config
```

To:

```yaml
# AFTER (pulls pre-built image)
django:
  image: ghcr.io/bluestemso/taylor_learns_dot_com:latest
  restart: unless-stopped
  # ... rest of config
```

**Complete updated django service:**

```yaml
  # 5. Django Blog Application (taylorlearns.com)
  django:
    # Pull the pre-built image from GitHub Container Registry
    image: ghcr.io/bluestemso/taylor_learns_dot_com:latest
    restart: unless-stopped
    environment:
      # Database connection (uses shared postgres service)
      - DATABASE_URL=postgresql://${DB_USER:-taylorlearns}:${DB_PASSWORD}@postgres:5432/${DB_NAME:-taylorlearnsblog}

      # Django configuration
      - DJANGO_SECRET=${DJANGO_SECRET}
      - DJANGO_DEBUG=${DJANGO_DEBUG:-False}
      - ALLOWED_HOSTS=${ALLOWED_HOSTS:-taylorlearns.com,www.taylorlearns.com}
      - CSRF_TRUSTED_ORIGINS=${CSRF_TRUSTED_ORIGINS:-https://taylorlearns.com,https://www.taylorlearns.com}
      - SESSION_COOKIE_SECURE=True

      # Optional services
      - CLOUDFLARE_EMAIL=${CLOUDFLARE_EMAIL:-}
      - CLOUDFLARE_TOKEN=${CLOUDFLARE_TOKEN:-}
      - CLOUDFLARE_ZONE_ID=${CLOUDFLARE_ZONE_ID:-}
      - SENTRY_DSN=${SENTRY_DSN:-}
      - SCREENSHOT_SECRET=${SCREENSHOT_SECRET:-}
    volumes:
      - django_static:/app/staticfiles
      - django_media:/app/media
    networks:
      - app-network
    depends_on:
      postgres:
        condition: service_healthy
    expose:
      - "8000"
    # Nginx Proxy Manager proxies to django:8000
```

**Full template available in:** `deployment/docker-compose.server.yml`

### Step 3: Test the Configuration

Before deploying, verify everything works:

```bash
cd /home/tschaack/app-stack

# Test docker-compose configuration
docker compose config

# Should see no errors and django service should show:
# image: ghcr.io/bluestemso/taylor_learns_dot_com:latest
```

### Step 4: Initial Deployment (Manual)

Since GitHub Actions hasn't run yet (no image exists), we need to do the first deployment manually:

```bash
cd /home/tschaack/app-stack

# Stop current Django container
docker compose stop django

# Build the initial image locally (one time only)
docker compose build django

# Tag it as if it came from ghcr.io (temporarily)
docker tag app-stack-django:latest ghcr.io/bluestemso/taylor_learns_dot_com:latest

# Start with new configuration
docker compose up -d django

# Run migrations
docker compose exec django uv run python manage.py migrate

# Check logs
docker compose logs django

# Verify it's working
curl -I http://localhost:8000
```

### Step 5: Make GitHub Package Public

After the first GitHub Actions run creates the package:

1. Go to https://github.com/bluestemso?tab=packages
2. Click on `taylor_learns_dot_com` package
3. Package settings → Change visibility → Public
4. Confirm

This allows your server to pull images without authentication.

### Step 6: Trigger First GitHub Actions Deployment

From your local machine:

```bash
# Make sure all changes are pushed
git status
git add .
git commit -m "Configure production deployment with GitHub Container Registry"
git push origin main

# Watch deployment
# Go to: https://github.com/bluestemso/taylor_learns_dot_com/actions
```

The workflow will:
1. Build Docker image
2. Push to ghcr.io
3. SSH to your server
4. Pull the new image
5. Recreate the Django container
6. Run migrations

### Step 7: Verify Deployment

After GitHub Actions completes:

```bash
# On your server
cd /home/tschaack/app-stack

# Check container status
docker compose ps django

# View recent logs
docker compose logs django --tail=50

# Verify it's using the pulled image
docker compose images django
# Should show: ghcr.io/bluestemso/taylor_learns_dot_com:latest

# Test the site
curl -I https://taylorlearns.com
```

## Post-Setup Verification

### ✅ Checklist

- [ ] Environment file exists at `/home/tschaack/app-stack/.env`
- [ ] Environment file has `DB_PASSWORD` and `DJANGO_SECRET`
- [ ] Server's `docker-compose.yml` uses `image:` not `build:`
- [ ] Django container is running: `docker compose ps django`
- [ ] No errors in logs: `docker compose logs django | grep -i error`
- [ ] Site is accessible: `https://taylorlearns.com`
- [ ] GitHub package is public (for easier pulling)
- [ ] GitHub Actions workflow completes successfully

### 🎯 Success Criteria

You'll know it's working when:
1. `docker compose images django` shows `ghcr.io/bluestemso/taylor_learns_dot_com:latest`
2. https://taylorlearns.com loads correctly
3. Pushing to main triggers automatic deployment
4. GitHub Actions "Deploy to Production" workflow shows green checkmarks

## Troubleshooting

### "required variable DB_PASSWORD is missing"

```bash
# Check if .env file exists
ls -la /home/tschaack/app-stack/.env

# Verify contents
cat /home/tschaack/app-stack/.env | grep DB_PASSWORD

# If missing, go back to Step 1
```

### "image not found: ghcr.io/bluestemso/taylor_learns_dot_com:latest"

This means GitHub Actions hasn't pushed an image yet, or the package isn't public.

**Solution A:** Wait for GitHub Actions to run once after pushing
**Solution B:** Follow Step 4 to create initial image manually

### Container starts but site shows 500 error

```bash
# Check Django logs
docker compose logs django --tail=100

# Common issues:
# - DATABASE_URL wrong format
# - Missing migrations
# - Wrong ALLOWED_HOSTS

# Run migrations
docker compose exec django uv run python manage.py migrate

# Check database connection
docker compose exec django uv run python manage.py check --database default
```

### GitHub Actions fails with "permission denied"

Check SSH key is configured correctly:
```bash
# From your local machine
ssh -i ~/.ssh/id_ed25519 tschaack@65.109.139.248 "echo 'SSH works'"
```

If that fails, the SSH_PRIVATE_KEY secret in GitHub is wrong.

## Rolling Back

If something goes wrong and you need to revert:

```bash
cd /home/tschaack/app-stack

# Stop the new container
docker compose stop django

# Restore old configuration in docker-compose.yml (use build: instead of image:)

# Rebuild
docker compose build django
docker compose up -d django
```

## Next Steps After Setup

Once everything is working:

1. **Test the workflow**: Make a small change locally, push to main, verify automatic deployment
2. **Set up monitoring**: Consider adding Sentry (SENTRY_DSN in .env)
3. **Schedule backups**: Set up automated database backups
4. **Update DNS**: Ensure taylorlearns.com points to your VPS
5. **Configure SSL**: Verify Let's Encrypt certificates in Nginx Proxy Manager

## Getting Help

If you run into issues:

1. Check `/home/tschaack/app-stack/.env` exists and has required variables
2. Run `docker compose logs django` to see error messages
3. Verify `docker compose config` shows no errors
4. Check GitHub Actions logs for deployment failures
5. Test database connectivity: `docker compose exec postgres psql -U taylorlearns -d taylorlearnsblog`

**Reference documentation:**
- `deployment/README.md` - Full deployment guide
- `deployment/.env.server.example` - Environment variable template
- `deployment/docker-compose.server.yml` - Complete server docker-compose template
