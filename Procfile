# =============================================================================
# Procfile - Not Currently Used
# =============================================================================
# This file was originally used for Heroku-style PaaS deployments.
#
# CURRENT DEPLOYMENT: The project now deploys to a Hetzner VPS using Docker
# Compose and GitHub Actions (see .github/workflows/deploy.yml).
#
# This file is kept for reference in case you want to deploy to a platform
# that uses Procfiles (Heroku, Render.com, Railway, etc.).
#
# HOW THIS WOULD WORK (if using a Procfile-based platform):
# - 'release': Commands run once before the app starts (migrations, static files)
# - 'web': The main process that serves the application
# =============================================================================

# Run migrations and collect static files before deployment
release: python manage.py collectstatic --noinput && python manage.py migrate --noinput

# Start Gunicorn web server (not used in current Docker deployment)
web: gunicorn config.wsgi --log-file -