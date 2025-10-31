# Recommended Improvements Before Initialization

This document outlines recommended changes to make before populating the database and going live. These improvements address architecture, security, dependencies, and deployment considerations.

## 🔴 Critical (Must Do Before Going Live)

### 1. Remove Heroku-Specific References

**Location:** `config/settings.py`, `blog/views.py`, `templates/tools.html`, `config/nginx.conf.erb`

**Issues:**
- Line 96 in `config/settings.py`: References `HEROKU_SLUG_COMMIT` for Sentry release tracking
- Line 659 in `blog/views.py`: Uses `HEROKU_SLUG_COMMIT` for deployment hash
- `config/nginx.conf.erb`: Contains Heroku-specific comments and configuration

**Recommendation:**
- Replace `HEROKU_SLUG_COMMIT` with `GIT_COMMIT` or similar environment variable you'll set in your VPS
- For VPS deployments, consider using `git rev-parse HEAD` or Docker image tags
- Update `Procfile` documentation (you'll likely use systemd or Docker on Hetzner)

**Example fix:**
```python
# In settings.py, replace HEROKU_SLUG_COMMIT with:
"release": os.environ.get("GIT_COMMIT") or os.environ.get("DEPLOY_VERSION", ""),

# In views.py:
"deployed_hash": os.environ.get("GIT_COMMIT") or os.environ.get("DEPLOY_VERSION"),
```

### 2. Fix Security Settings

**Location:** `config/settings.py`

**Issues:**
- Line 170: `ALLOWED_HOSTS = ["*"]` is too permissive and a security risk
- Missing production security headers (HSTS, CSP, etc.)
- Debug mode could accidentally be enabled in production
- Secret key has weak fallback

**Recommendations:**
```python
# Replace ALLOWED_HOSTS with:
ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")

# Add security headers:
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = "DENY"
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

# Remove or strengthen secret key fallback:
if not os.environ.get("DJANGO_SECRET"):
    raise ValueError("DJANGO_SECRET environment variable must be set")
```

### 3. Update Outdated Sentry Integration

**Location:** `requirements.txt`, `config/settings.py`

**Issue:**
- `raven>=3` is deprecated. Sentry now uses `sentry-sdk` instead
- Line 93-96 in `settings.py` uses old `raven.contrib.django.raven_compat`

**Recommendation:**
- Replace `raven>=3` with `sentry-sdk>=2.0.0` in `requirements.txt`
- Update Sentry configuration in `settings.py`:
```python
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

SENTRY_DSN = os.environ.get("SENTRY_DSN")
if SENTRY_DSN:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[DjangoIntegration()],
        traces_sample_rate=0.1,
        send_default_pii=False,
        release=os.environ.get("GIT_COMMIT", ""),
    )
```

### 4. Replace Hardcoded Database Name

**Location:** `config/settings.py` lines 129-141

**Issue:**
- Database name hardcoded as `"simonwillisonblog"` in default configuration

**Recommendation:**
```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("DB_NAME", "taylorlearnsblog"),
        "USER": os.environ.get("DB_USER", ""),
        "PASSWORD": os.environ.get("DB_PASSWORD", ""),
        "HOST": os.environ.get("DB_HOST", "localhost"),
        "PORT": os.environ.get("DB_PORT", "5432"),
    },
    # ... dashboard config
}
```

**Note:** The `DATABASE_URL` override (line 155) will still work, but having proper defaults helps.

### 5. Update Branding in Templates

**Locations:** Multiple template files

**Files to update:**
- `templates/about.html`: Contains Simon Willison's bio, links, and disclosure info
- `templates/smallhead.html`: "Simon Willison's Weblog" header
- `templates/wide.html`: Contains links to Simon's Mastodon/Twitter
- `templates/tools.html`: References Simon's GitHub repo URL
- Any other templates referencing simonwillison.net URLs

**Recommendation:**
- Create your own about page content
- Update all hardcoded URLs and references
- Update site name in templates
- Review all template files for personal references

## 🟡 Important (Should Do Soon)

### 6. Improve Caching Strategy for VPS

**Location:** `config/settings.py` lines 196-200

**Current:** Uses `LocMemCache` which is not suitable for production with multiple processes

**Recommendation for Hetzner VPS:**
- Use Redis or Memcached for production
- Install `django-redis` or `python-memcached`
```python
# For Redis (recommended):
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": os.environ.get("REDIS_URL", "redis://127.0.0.1:6379/1"),
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}
```

### 7. Update Dependencies

**Location:** `requirements.txt`

**Recommendations:**
- Pin all dependencies to specific versions (many already are, good!)
- Review for security vulnerabilities: `pip-audit` or `safety check`
- Consider adding `python-dotenv` for local development
- Review `djp` usage - this appears to be a custom package that might not be needed

**Note:** The dependencies look relatively modern, but run:
```bash
pip install pip-audit
pip-audit -r requirements.txt
```

### 8. Environment Variable Documentation

**Recommendation:**
Create a `.env.example` file documenting all required environment variables:
```bash
# Required
DJANGO_SECRET=your-secret-key-here
DATABASE_URL=postgres://user:pass@localhost/dbname
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Optional
DJANGO_DEBUG=
STAGING=
SENTRY_DSN=
REDIS_URL=redis://127.0.0.1:6379/1
GIT_COMMIT=
CLOUDFLARE_EMAIL=
CLOUDFLARE_TOKEN=
CLOUDFLARE_ZONE_ID=
```

### 9. Deployment Configuration for Hetzner VPS

**Recommendations:**
- Remove or update `Procfile` (Heroku-specific)
- Create deployment scripts:
  - `deploy.sh` for manual deployments
  - Consider systemd service files
  - Or Docker setup with `docker-compose.yml`
- Set up nginx as reverse proxy (replace Heroku's routing)
- Configure SSL with Let's Encrypt
- Set up automated backups for PostgreSQL

**Example systemd service file:**
```ini
[Unit]
Description=Taylor Learns Blog Gunicorn
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/path/to/taylor_learns_dot_com
Environment="PATH=/path/to/venv/bin"
ExecStart=/path/to/venv/bin/gunicorn \
    --workers 3 \
    --bind unix:/run/gunicorn.sock \
    config.wsgi:application

[Install]
WantedBy=multi-user.target
```

### 10. Remove or Update Old Import Data

**Location:** `old-import-xml/` directory

**Recommendation:**
- Remove or archive this directory if not needed
- These appear to be old import files from Simon's blog
- Not needed for your new blog

## 🟢 Nice to Have (Can Do Later)

### 11. Modernize Settings Structure

**Recommendation:**
- Split settings into `base.py`, `development.py`, `production.py`
- Use `django-environ` for better environment variable management
- This makes configuration management cleaner as the project grows

### 12. Add Health Check Endpoint

**Recommendation:**
Create a simple health check view for monitoring:
```python
# In blog/views.py
from django.http import JsonResponse
from django.db import connection

def health_check(request):
    try:
        connection.ensure_connection()
        return JsonResponse({"status": "ok", "database": "connected"})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=503)
```

### 13. Review and Update Tests

**Location:** `blog/tests.py`

**Recommendation:**
- Ensure test database name doesn't hardcode "simonwillisonblog"
- Review test coverage
- Add tests for any custom functionality you add

### 14. Static Files Strategy

**Current:** Uses WhiteNoise for static file serving

**Recommendation:**
- WhiteNoise works fine for small-to-medium sites
- For production on VPS, consider:
  - Nginx serving static files directly (better performance)
  - Or continue with WhiteNoise (simpler, less config)
- Keep WhiteNoise as fallback for simpler deployments

### 15. Add Logging Configuration

**Recommendation:**
Add proper logging configuration in `settings.py`:
```python
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "file": {
            "level": "INFO",
            "class": "logging.FileHandler",
            "filename": os.environ.get("LOG_FILE", "/var/log/django/blog.log"),
        },
        "console": {
            "level": "DEBUG" if DEBUG else "INFO",
            "class": "logging.StreamHandler",
        },
    },
    "root": {
        "handlers": ["console", "file"],
        "level": "INFO",
    },
    "loggers": {
        "django": {
            "handlers": ["console", "file"],
            "level": os.getenv("DJANGO_LOG_LEVEL", "INFO"),
            "propagate": False,
        },
    },
}
```

## 📋 Pre-Launch Checklist

Before populating the database and going live:

- [ ] Remove all Heroku-specific references
- [ ] Fix `ALLOWED_HOSTS` security setting
- [ ] Update Sentry integration to `sentry-sdk`
- [ ] Replace hardcoded database name
- [ ] Update all branding in templates (about page, headers, etc.)
- [ ] Set up proper environment variables
- [ ] Configure production-ready caching (Redis)
- [ ] Set up SSL/TLS certificates
- [ ] Configure nginx reverse proxy
- [ ] Set up automated database backups
- [ ] Test deployment process end-to-end
- [ ] Review and update `README.md` with your deployment info
- [ ] Remove old import XML files if not needed
- [ ] Run security audit on dependencies

## 🚀 Hetzner VPS Deployment Considerations

Since you're moving to Hetzner VPS:

1. **Process Management:** Use systemd or supervisor (not Procfile)
2. **Reverse Proxy:** Set up nginx in front of Gunicorn
3. **SSL:** Use certbot for Let's Encrypt certificates
4. **Database:** PostgreSQL on same VPS or separate
5. **Backups:** Automated pg_dump to remote storage
6. **Monitoring:** Set up basic uptime monitoring
7. **Logs:** Configure log rotation

## Security Notes

1. Never commit `.env` files or secrets
2. Use strong `DJANGO_SECRET` (generate with `python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'`)
3. Keep dependencies updated
4. Enable Django's security middleware
5. Set proper file permissions on VPS
6. Use firewall (ufw) to restrict access
7. Regular security updates for OS packages

---

**Priority Order:**
1. Critical items (#1-5) - Do before any production deployment
2. Important items (#6-10) - Do before going live
3. Nice to have (#11-15) - Can iterate on after launch

