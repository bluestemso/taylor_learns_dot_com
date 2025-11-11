# Dockerfile for taylorlearns.com Django application

FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN pip install uv

# Set work directory
WORKDIR /app

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install Python dependencies
RUN uv sync --frozen

# Copy project
COPY . .

# Create non-root user BEFORE collecting static files
RUN useradd -m -u 1000 django && \
    chown -R django:django /app

# Switch to django user for all subsequent operations
USER django

# Collect static files during build so they're part of the image
# Use environment variables only for this RUN command (won't persist in image)
# Run as django user to ensure .venv has correct permissions
RUN mkdir -p /app/staticfiles /app/media && \
    DJANGO_SECRET=build-time-secret \
    DB_NAME=placeholder \
    DB_USER=placeholder \
    DB_PASSWORD=placeholder \
    DB_HOST=placeholder \
    uv run python manage.py collectstatic --noinput

# Expose port
EXPOSE 8000

# Default command (can be overridden)
CMD ["uv", "run", "gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4", "--threads", "2"]



