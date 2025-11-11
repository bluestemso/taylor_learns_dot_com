#!/bin/bash
# Diagnostic script for static files issues

echo "=== Checking Django container status ==="
docker compose ps django

echo ""
echo "=== Checking static files in container ==="
docker compose exec django ls -la /app/staticfiles/ | head -20

echo ""
echo "=== Checking static directory permissions ==="
docker compose exec django ls -la /app/ | grep static

echo ""
echo "=== Checking Django static files configuration ==="
docker compose exec django uv run python manage.py collectstatic --dry-run --noinput | tail -20

echo ""
echo "=== Checking for CSS files ==="
docker compose exec django find /app/staticfiles -name "*.css" | head -10

echo ""
echo "=== Testing static file access from inside container ==="
docker compose exec django curl -I http://localhost:8000/static/css/design-system.css

echo ""
echo "=== Checking Django logs for static file errors ==="
docker compose logs django --tail 50 | grep -i "static\|css\|404"

echo ""
echo "=== Checking environment variables ==="
docker compose exec django env | grep -E "STATIC|DEBUG|DJANGO"
