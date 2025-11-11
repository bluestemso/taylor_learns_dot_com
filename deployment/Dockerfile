# =============================================================================
# Dockerfile for taylorlearns.com Django Application
# =============================================================================
# This file defines how to build a Docker container for the Django blog.
# Docker containers are like lightweight virtual machines that package your
# app with all its dependencies, ensuring it runs the same everywhere.
#
# Build command: docker build -f deployment/Dockerfile -t taylorlearns .
# Run command: docker compose up (uses docker-compose.yml)
# =============================================================================

# -----------------------------------------------------------------------------
# Base Image Selection
# -----------------------------------------------------------------------------
# FROM specifies the starting point for our container.
# We use python:3.11-slim which is an official Python image with:
# - Python 3.11 pre-installed
# - "slim" variant: smaller size, only essential packages (reduces attack surface)
# - Debian-based Linux system underneath
FROM python:3.11-slim

# -----------------------------------------------------------------------------
# Environment Variables for Python Optimization
# -----------------------------------------------------------------------------
# ENV sets environment variables that persist in the container.
# These optimize Python's behavior for running in containers:
ENV PYTHONUNBUFFERED=1 \
    # ↑ Forces Python output to appear immediately in logs (no buffering)
    # This is crucial for debugging - you see print() and errors right away
    PYTHONDONTWRITEBYTECODE=1 \
    # ↑ Prevents Python from creating .pyc bytecode files
    # Not needed in containers since the code doesn't change after build
    PIP_NO_CACHE_DIR=1 \
    # ↑ Tells pip not to cache downloaded packages (saves space)
    PIP_DISABLE_PIP_VERSION_CHECK=1
    # ↑ Stops pip from checking for updates (speeds up builds slightly)

# -----------------------------------------------------------------------------
# Install System Dependencies
# -----------------------------------------------------------------------------
# RUN executes commands during the build process.
# We install system-level packages needed by our Python dependencies.
RUN apt-get update && apt-get install -y --no-install-recommends \
    # apt-get update: refreshes the package list
    # --no-install-recommends: only installs essential dependencies (smaller image)
    build-essential \
    # ↑ Compilers and build tools (gcc, make) needed to build some Python packages
    libpq-dev \
    # ↑ PostgreSQL client library headers - required by psycopg2 (Python PostgreSQL driver)
    curl \
    # ↑ Command-line tool for making HTTP requests (used for health checks)
    ca-certificates \
    # ↑ SSL certificates needed for HTTPS connections
    && rm -rf /var/lib/apt/lists/*
    # ↑ Cleanup: removes package lists to reduce image size (saves ~20-30MB)
    # This is safe because we already installed everything we need

# -----------------------------------------------------------------------------
# Install uv (Modern Python Package Manager)
# -----------------------------------------------------------------------------
# uv is a faster alternative to pip, written in Rust.
# It handles both package installation and virtual environment management.
# We install it globally using pip (which comes with the Python base image).
RUN pip install uv

# -----------------------------------------------------------------------------
# Set Working Directory
# -----------------------------------------------------------------------------
# WORKDIR creates the directory if it doesn't exist and sets it as the
# current directory for all subsequent commands.
# Think of it like "cd /app" that persists for the rest of the Dockerfile.
WORKDIR /app

# -----------------------------------------------------------------------------
# Copy Dependency Files First (Layer Caching Optimization)
# -----------------------------------------------------------------------------
# COPY moves files from your local machine into the container.
# We copy dependency files BEFORE the application code because:
# 1. Dependencies change less frequently than application code
# 2. Docker caches each step - if dependencies haven't changed, it reuses
#    the cached layer, making rebuilds much faster
COPY pyproject.toml uv.lock ./
# pyproject.toml: defines our project and its dependencies
# uv.lock: locks exact versions of all dependencies (ensures reproducible builds)

# -----------------------------------------------------------------------------
# Install Python Dependencies
# -----------------------------------------------------------------------------
# uv sync installs all dependencies defined in pyproject.toml
# --frozen: fails if uv.lock is out of sync (prevents accidentally using wrong versions)
# This creates a .venv directory with all our Python packages
RUN uv sync --frozen

# -----------------------------------------------------------------------------
# Copy Application Code
# -----------------------------------------------------------------------------
# Now we copy the rest of the application code.
# This happens AFTER dependency installation because:
# - App code changes frequently (every deployment)
# - Dependencies change rarely
# - This ordering maximizes Docker's layer caching efficiency
COPY . .

# -----------------------------------------------------------------------------
# Create Non-Root User (Security Best Practice)
# -----------------------------------------------------------------------------
# Running containers as root is a security risk. If an attacker compromises
# the container, they shouldn't have root privileges.
# useradd creates a new user named "django" with:
# -m: creates a home directory
# -u 1000: sets user ID to 1000 (standard first user ID on Linux systems)
RUN useradd -m -u 1000 django && \
    chown -R django:django /app
    # ↑ Changes ownership of /app and all its contents to the django user
    # This allows the django user to read/write files in /app

# -----------------------------------------------------------------------------
# Switch to Non-Root User
# -----------------------------------------------------------------------------
# USER changes which user runs all subsequent commands (in build and at runtime).
# From this point on, everything runs as the 'django' user, not root.
USER django

# -----------------------------------------------------------------------------
# Collect Static Files (CSS, JavaScript, Images)
# -----------------------------------------------------------------------------
# Django's collectstatic command gathers all static files from various apps
# and puts them in one directory (/app/staticfiles) for efficient serving.
# We do this during build (not at runtime) because:
# 1. Static files don't change between restarts
# 2. Makes container startup faster
# 3. The files become part of the image (immutable, versioned)
RUN mkdir -p /app/staticfiles /app/media && \
    # ↑ Create directories for static files and user uploads
    DJANGO_SECRET=build-time-secret \
    DATABASE_URL=postgresql://placeholder:placeholder@placeholder:5432/placeholder \
    DB_NAME=placeholder \
    DB_USER=placeholder \
    DB_PASSWORD=placeholder \
    DB_HOST=placeholder \
    # ↑ Django settings require these env vars, but we use dummy values here
    # because we're only collecting static files (no database connection needed).
    # Real values come from docker-compose.yml at runtime.
    uv run python manage.py collectstatic --noinput
    # ↑ Runs Django's collectstatic command via uv (which activates the .venv)
    # --noinput: don't prompt for confirmation (required for automated builds)

# -----------------------------------------------------------------------------
# Expose Port
# -----------------------------------------------------------------------------
# EXPOSE documents which port the container listens on.
# This is mainly for documentation - the actual port mapping is defined in
# docker-compose.yml. Port 8000 is Django/Gunicorn's default.
EXPOSE 8000

# -----------------------------------------------------------------------------
# Default Command
# -----------------------------------------------------------------------------
# CMD specifies what command runs when the container starts.
# This can be overridden in docker-compose.yml.
# We use Gunicorn (production-grade WSGI server) instead of Django's development
# server because it can handle multiple concurrent requests efficiently.
CMD ["uv", "run", "gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4", "--threads", "2"]
# ↑ Breakdown:
# - uv run: activates the virtual environment and runs the command
# - gunicorn: the WSGI server
# - config.wsgi:application: points to our Django WSGI application
# - --bind 0.0.0.0:8000: listen on all network interfaces, port 8000
#   (0.0.0.0 means "accept connections from any IP", needed in containers)
# - --workers 4: run 4 worker processes (handles concurrent requests)
#   Rule of thumb: 2-4 × number of CPU cores
# - --threads 2: each worker can handle 2 threads (more concurrency)



