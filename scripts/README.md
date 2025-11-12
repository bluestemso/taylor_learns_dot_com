# Database Management Scripts

This directory contains scripts for managing database dumps and restores between production and local development environments.

## Overview

Working with a local copy of production data is a common workflow. These scripts make it easy to:

1. Create a snapshot of production data
2. Download it to your local machine
3. Restore it to your local PostgreSQL
4. Continue development with realistic data

## Prerequisites

### On Production Server
- Docker and Docker Compose installed
- SSH access to the production server
- App running in Docker containers

### On Local Machine
- Docker and Docker Compose installed
- `.env` file configured (copy from `.env.example`)
- Sufficient disk space for database dump

## Workflow

All commands run on your **LOCAL MACHINE**. The fetch script handles SSH connections to production automatically.

### 1. Fetch Production Database

**Run this on your LOCAL MACHINE:**

```bash
# Fetch database dump from production
./scripts/fetch-production-db.sh user@your-server ~/app-stack/taylor_learns_dot_com

# Or use shorter path (defaults to ~/app-stack/taylor_learns_dot_com)
./scripts/fetch-production-db.sh user@your-server

# Or set environment variables for convenience
export PROD_SSH_HOST=user@your-server
export PROD_APP_DIR=~/app-stack/taylor_learns_dot_com
./scripts/fetch-production-db.sh
```

This script will:
1. SSH into your production server
2. Use `docker compose exec` to create a PostgreSQL dump
3. Download the dump to `./scripts/db_dump_YYYY-MM-DD.sql`
4. Clean up the remote dump file

### 2. Restore to Local Database

**Run this on your LOCAL MACHINE:**

```bash
# Restore the dump (use the filename from step 1)
./scripts/restore-local-db.sh scripts/db_dump_2024-11-12.sql
```

The restore script will:
- Start your local PostgreSQL container
- Drop and recreate the database
- Import all data from the dump
- Run Django migrations to ensure schema is current

### 3. Start Development

You're now ready to develop with production data!

```bash
# Option A: Run Django in Docker
docker compose up -d django
# Access at http://localhost:8000

# Option B: Run Django locally (outside Docker)
uv run python manage.py runserver
# Access at http://127.0.0.1:8000
```

## Local vs Docker Development

You have two options for running Django locally:

### Option A: Docker Development (Recommended for consistency)

```bash
# Start both PostgreSQL and Django in Docker
docker compose up -d

# View logs
docker compose logs -f django

# Run management commands
docker compose exec django uv run python manage.py shell
```

**Pros:**
- Matches production environment exactly
- No need to install PostgreSQL locally
- Consistent across different machines

**Cons:**
- Slightly slower than native development
- Requires Docker Desktop/Engine

### Option B: Native Development (Faster for rapid iteration)

```bash
# Start only PostgreSQL in Docker
docker compose up -d postgres

# Run Django locally
uv run python manage.py runserver

# Run management commands directly
uv run python manage.py shell
```

**Pros:**
- Faster startup and reload times
- Easier debugging with IDE
- Direct access to Python environment

**Cons:**
- Need to manage local Python environment
- Still need Docker for PostgreSQL

## Database Connection Strings

Your local `.env` file should be configured for Docker networking:

```bash
# For Docker development (both Django and PostgreSQL in Docker)
DATABASE_URL=postgres://taylorlearns:password@postgres:5432/taylorlearnsblog

# OR use individual variables
DB_HOST=postgres
DB_PORT=5432
DB_NAME=taylorlearnsblog
DB_USER=taylorlearns
DB_PASSWORD=your_password_here
```

If running Django locally (outside Docker) but PostgreSQL in Docker:

```bash
# Change host from 'postgres' to 'localhost'
DATABASE_URL=postgres://taylorlearns:password@localhost:5432/taylorlearnsblog

# OR
DB_HOST=localhost
DB_PORT=5432
```

## Troubleshooting

### "Docker container not found"

Make sure PostgreSQL is running:
```bash
docker compose up -d postgres
```

### "Permission denied" when running scripts

Make scripts executable:
```bash
chmod +x scripts/*.sh
```

### "Database already exists" error

The restore script drops and recreates the database automatically. If you see this error, try:

```bash
# Manually drop the database
docker compose exec postgres psql -U taylorlearns -d postgres -c "DROP DATABASE taylorlearnsblog;"

# Then run restore again
./scripts/restore-local-db.sh scripts/db_dump_2024-11-12.sql
```

### "Connection refused" to PostgreSQL

Wait a bit longer for PostgreSQL to fully start:

```bash
docker compose up -d postgres
sleep 5  # Wait 5 seconds
./scripts/restore-local-db.sh scripts/db_dump_2024-11-12.sql
```

### SSH connection issues

If you get "Permission denied" or "Connection refused":

```bash
# Test SSH connection first
ssh user@your-server "echo 'Connection successful'"

# Make sure you can access the remote directory
ssh user@your-server "ls -la ~/app-stack/taylor_learns_dot_com"

# Verify Docker is accessible remotely
ssh user@your-server "docker compose version"
```

### Large dump files

Production dumps can be large. The fetch script handles this automatically, but if you need to manually compress:

```bash
# Compress existing dump
gzip scripts/db_dump_2024-11-12.sql

# Decompress when needed
gunzip scripts/db_dump_2024-11-12.sql.gz
```

## Data Sanitization

**Important:** Production dumps may contain sensitive data (user emails, personal information, etc.).

For a production application with sensitive data, you should sanitize the dump before using it locally:

```bash
# Example: Anonymize user emails
docker compose exec postgres psql -U taylorlearns -d taylorlearnsblog -c \
  "UPDATE auth_user SET email = CONCAT('user', id, '@example.com');"
```

Currently this blog doesn't have user accounts, but keep this in mind if you add authentication in the future.

## Best Practices

1. **Regular Refreshes**: Refresh your local data weekly or before starting new features
2. **Name Dumps with Dates**: Makes it easy to track freshness
3. **Clean Up Old Dumps**: Delete dumps older than 30 days to save space
4. **Don't Commit Dumps**: Database dumps are in `.gitignore` and should never be committed
5. **Document Schema Changes**: If you add migrations locally, make sure they're committed

## Security Notes

- Never commit `.env` files or database dumps to Git
- Production credentials should never be used locally
- Database dumps are excluded from Git via `.gitignore`
- For sensitive production data, implement proper sanitization
