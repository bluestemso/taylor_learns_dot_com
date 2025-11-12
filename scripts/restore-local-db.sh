#!/bin/bash
# =============================================================================
# Local Database Restore Script
# =============================================================================
# This script restores a production database dump to your local PostgreSQL.
# Run this ON YOUR LOCAL MACHINE.
#
# Usage:
#   ./scripts/restore-local-db.sh <dump-file>
#
# Example:
#   ./scripts/restore-local-db.sh scripts/db_dump_2024-11-12.sql
#
# Prerequisites:
#   - Docker and Docker Compose installed
#   - Local PostgreSQL container running (docker compose up -d postgres)
# =============================================================================

set -e  # Exit on any error

# Check if dump file was provided
if [ $# -eq 0 ]; then
    echo "ERROR: No dump file specified!"
    echo ""
    echo "Usage: $0 <dump-file>"
    echo ""
    echo "Example: $0 scripts/db_dump_2024-11-12.sql"
    exit 1
fi

DUMP_FILE="$1"

# Check if dump file exists
if [ ! -f "${DUMP_FILE}" ]; then
    echo "ERROR: Dump file not found: ${DUMP_FILE}"
    exit 1
fi

echo "=========================================="
echo "Local Database Restore"
echo "=========================================="
echo "Dump file: ${DUMP_FILE}"
echo "Timestamp: $(date)"
echo ""

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    echo "ERROR: docker-compose.yml not found!"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "ERROR: .env file not found!"
    echo "Please copy .env.example to .env and configure it first"
    exit 1
fi

# Source the .env file to get DB credentials
export $(cat .env | grep -v '^#' | xargs)

echo "Step 1: Ensuring PostgreSQL container is running..."
docker compose up -d postgres

echo "Waiting for PostgreSQL to be ready..."
sleep 3

echo ""
echo "Step 2: Dropping existing database (if exists)..."
docker compose exec -T postgres psql -U "${DB_USER}" -d postgres -c "DROP DATABASE IF EXISTS ${DB_NAME};" || true

echo ""
echo "Step 3: Creating fresh database..."
docker compose exec -T postgres psql -U "${DB_USER}" -d postgres -c "CREATE DATABASE ${DB_NAME};"

echo ""
echo "Step 4: Restoring database from dump..."
cat "${DUMP_FILE}" | docker compose exec -T postgres psql -U "${DB_USER}" -d "${DB_NAME}"

echo ""
echo "Step 5: Running Django migrations (to ensure schema is up-to-date)..."
docker compose exec django uv run python manage.py migrate --noinput || uv run python manage.py migrate --noinput

echo ""
echo "=========================================="
echo "SUCCESS!"
echo "=========================================="
echo "Your local database has been restored with production data."
echo ""
echo "Next steps:"
echo "1. Start the Django development server:"
echo "   docker compose up -d django"
echo "   # OR run locally: uv run python manage.py runserver"
echo ""
echo "2. Access the site at http://localhost:8000"
echo ""
echo "3. (Optional) Create a local superuser for admin access:"
echo "   uv run python manage.py createsuperuser"
echo ""
