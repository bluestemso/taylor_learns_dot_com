#!/bin/bash
# =============================================================================
# Fetch Production Database Script
# =============================================================================
# This script runs on YOUR LOCAL MACHINE and remotely creates a database dump
# from the production server, then downloads it.
#
# Usage:
#   ./scripts/fetch-production-db.sh [SSH_HOST] [REMOTE_APP_DIR]
#
# Examples:
#   ./scripts/fetch-production-db.sh user@server.com ~/app-stack/taylor_learns_dot_com
#   ./scripts/fetch-production-db.sh user@server.com  # Uses default path
#
# Environment Variables (optional):
#   PROD_SSH_HOST - SSH connection string (e.g., user@server.com)
#   PROD_APP_DIR  - Remote app directory path
# =============================================================================

set -e  # Exit on any error

# Configuration
TIMESTAMP=$(date +%Y-%m-%d)
DUMP_FILE="db_dump_${TIMESTAMP}.sql"
LOCAL_SCRIPTS_DIR="./scripts"

# Parse arguments or use environment variables
SSH_HOST="${1:-${PROD_SSH_HOST}}"
REMOTE_APP_DIR="${2:-${PROD_APP_DIR:-~/app-stack/taylor_learns_dot_com}}"

# Validate SSH host is provided
if [ -z "$SSH_HOST" ]; then
    echo "ERROR: SSH host not provided!"
    echo ""
    echo "Usage: $0 <ssh-host> [remote-app-dir]"
    echo ""
    echo "Examples:"
    echo "  $0 user@server.com"
    echo "  $0 user@server.com ~/app-stack/taylor_learns_dot_com"
    echo ""
    echo "Or set environment variables:"
    echo "  export PROD_SSH_HOST=user@server.com"
    echo "  export PROD_APP_DIR=~/app-stack/taylor_learns_dot_com"
    echo "  $0"
    exit 1
fi

echo "=========================================="
echo "Fetch Production Database"
echo "=========================================="
echo "SSH Host: ${SSH_HOST}"
echo "Remote Directory: ${REMOTE_APP_DIR}"
echo "Timestamp: $(date)"
echo "Output file: ${LOCAL_SCRIPTS_DIR}/${DUMP_FILE}"
echo ""

# Create scripts directory if it doesn't exist
mkdir -p "${LOCAL_SCRIPTS_DIR}"

echo "Step 1: Creating database dump on production server..."
echo "  Running: ssh ${SSH_HOST} 'cd ${REMOTE_APP_DIR} && docker compose exec -T postgres ...'"
echo ""

# Create dump on remote server using docker compose exec
# The -T flag disables pseudo-tty allocation (required for piping)
ssh "${SSH_HOST}" bash <<EOF
set -e
cd "${REMOTE_APP_DIR}"

# Get database credentials from docker compose config
DB_NAME=\$(docker compose exec -T django printenv DB_NAME | tr -d '\r')
DB_USER=\$(docker compose exec -T django printenv DB_USER | tr -d '\r')

echo "Creating dump of database: \${DB_NAME}"

# Create the dump
docker compose exec -T postgres pg_dump \\
    -U "\${DB_USER}" \\
    -d "\${DB_NAME}" \\
    --clean \\
    --if-exists \\
    --no-owner \\
    --no-acl \\
    > "${DUMP_FILE}"

# Check if dump was created successfully
if [ ! -f "${DUMP_FILE}" ]; then
    echo "ERROR: Dump file was not created!"
    exit 1
fi

# Show file size
du -h "${DUMP_FILE}"
EOF

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Failed to create database dump on remote server!"
    exit 1
fi

echo ""
echo "Step 2: Downloading dump file to local machine..."
scp "${SSH_HOST}:${REMOTE_APP_DIR}/${DUMP_FILE}" "${LOCAL_SCRIPTS_DIR}/"

if [ ! -f "${LOCAL_SCRIPTS_DIR}/${DUMP_FILE}" ]; then
    echo "ERROR: Failed to download dump file!"
    exit 1
fi

echo ""
echo "Step 3: Cleaning up remote dump file..."
ssh "${SSH_HOST}" "rm -f ${REMOTE_APP_DIR}/${DUMP_FILE}"

# Get local file size
LOCAL_SIZE=$(du -h "${LOCAL_SCRIPTS_DIR}/${DUMP_FILE}" | cut -f1)

echo ""
echo "=========================================="
echo "SUCCESS!"
echo "=========================================="
echo "Database dump downloaded: ${LOCAL_SCRIPTS_DIR}/${DUMP_FILE}"
echo "File size: ${LOCAL_SIZE}"
echo ""
echo "Next step: Restore to your local database"
echo "  ./scripts/restore-local-db.sh ${LOCAL_SCRIPTS_DIR}/${DUMP_FILE}"
echo ""
