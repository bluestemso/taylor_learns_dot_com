#!/bin/bash
# =============================================================================
# Production Database Dump Script
# =============================================================================
# This script creates a database dump from the production PostgreSQL container.
# Run this ON THE PRODUCTION SERVER via SSH.
#
# Usage:
#   ./scripts/dump-production-db.sh
#
# Output:
#   Creates db_dump_YYYY-MM-DD.sql in the current directory
# =============================================================================

set -e  # Exit on any error

# Configuration
TIMESTAMP=$(date +%Y-%m-%d)
DUMP_FILE="db_dump_${TIMESTAMP}.sql"

echo "=========================================="
echo "Production Database Dump"
echo "=========================================="
echo "Timestamp: $(date)"
echo "Output file: ${DUMP_FILE}"
echo ""

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "ERROR: docker-compose.yml not found!"
    echo "Please run this script from the app directory (usually ~/app-stack/taylor_learns_dot_com)"
    exit 1
fi

# Get database credentials from .env file
if [ ! -f ".env" ]; then
    echo "ERROR: .env file not found!"
    exit 1
fi

# Source the .env file
export $(cat .env | grep -v '^#' | xargs)

echo "Creating database dump from Docker container..."
docker compose exec -T postgres pg_dump \
    -U "${DB_USER}" \
    -d "${DB_NAME}" \
    --clean \
    --if-exists \
    --no-owner \
    --no-acl \
    > "${DUMP_FILE}"

# Check if dump was successful
if [ -f "${DUMP_FILE}" ]; then
    SIZE=$(du -h "${DUMP_FILE}" | cut -f1)
    echo ""
    echo "=========================================="
    echo "SUCCESS!"
    echo "=========================================="
    echo "Dump file created: ${DUMP_FILE}"
    echo "File size: ${SIZE}"
    echo ""
    echo "Next steps:"
    echo "1. Download this file to your local machine:"
    echo "   scp user@server:/path/to/${DUMP_FILE} ./scripts/"
    echo ""
    echo "2. Run the local restore script:"
    echo "   ./scripts/restore-local-db.sh ${DUMP_FILE}"
    echo ""
else
    echo "ERROR: Dump file was not created!"
    exit 1
fi
