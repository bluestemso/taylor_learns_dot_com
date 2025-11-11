# Taylor Schaack Blog

The code that runs my weblog, https://taylorlearns.com/

This blog is built on a Django-based foundation originally developed by Simon Willison. The following documentation includes insights from Simon's development and deployment practices, particularly from his posts in 2023-2024.

## Technology Stack

- **Django**: High-level Python web framework
- **PostgreSQL**: Database with full-text search capabilities
- **Gunicorn**: Python WSGI HTTP Server for production
- **WhiteNoise**: Static file serving
- **Django Admin**: Content management interface

## Development Practices

### Content Models

The blog uses custom Django models that inherit from a `BaseModel` for shared functionality:
- **Entry**: Full blog posts
- **Blogmark**: Link posts (as described in [Simon's December 2024 post](https://simonwillison.net/2024/Dec/22/link-blog/))
- **Quotation**: Quoted excerpts
- **Note**: Short notes

All models share features like:
- Tagging system
- Draft mode for previewing unpublished content
- Full-text search integration

### Draft Mode and Previews

Draft mode allows you to assign URLs to items for previewing in the browser without publishing them. This is particularly useful for reviewing content before it goes live. As Simon mentioned in his December 2024 post on link blogging, this feature helps streamline the content creation workflow.

### Image Handling

Based on Simon's practices:
- Images are converted to optimized JPEGs
- Uploaded to S3 bucket for storage
- Served via Cloudflare's free tier for cost-effective CDN delivery
- Alt text generation using language models (optional enhancement)

### Search Engine

This blog includes a built-in faceted search engine using Django and PostgreSQL:

1. The search functionality is implemented in the `search` function in `blog/search.py`.
2. It uses a combination of full-text search and tag-based filtering.
3. The search index is built and updated automatically when new content is added to the blog.
4. Users can search for content using keywords, which are matched against the full text of blog entries and blogmarks.
5. The search results are ranked based on relevance and can be further filtered by tags.
6. The search interface is integrated into the blog's user interface, allowing for a seamless user experience.

For more details on the implementation, refer to the `search` function in `blog/search.py`.

## Deployment Practices

### Automated Deployments

The blog is automatically deployed to a Hetzner VPS using GitHub Actions:
- **CI/CD Pipeline**: `.github/workflows/ci.yml` runs tests on every push/PR
- **Automated Deployment**: `.github/workflows/deploy.yml` deploys to production on push to `main`
- **Infrastructure**: Docker Compose orchestrates Django and PostgreSQL containers
- **Reverse Proxy**: Nginx Proxy Manager handles SSL/TLS and proxies requests to Django

### Deployment Architecture

**Hosting Environment:**
- **VPS Provider**: Hetzner Cloud
- **Operating System**: Linux (Docker host)
- **Orchestration**: Docker Compose
- **Reverse Proxy**: Nginx Proxy Manager (running in Docker)
- **Networking**: Docker network (`app-stack_app-network`) shared with other services

**Application Stack:**
- **Django/Gunicorn**: Application server (4 workers, 2 threads each)
- **PostgreSQL 15**: Database with persistent Docker volume
- **WhiteNoise**: Static file serving with content hashing
- **Docker**: Containerization for consistent deployments

### Deployment Workflow

**How Automatic Deployment Works:**
1. Developer pushes code to `main` branch
2. GitHub Actions CI runs tests automatically
3. If tests pass, deployment workflow triggers:
   - Connects to VPS via SSH (using GitHub Secrets)
   - Pulls latest code from GitHub repository
   - Builds new Docker image with updated code
   - Recreates Django container (zero-downtime)
   - Runs database migrations
   - Verifies deployment with health check

**Required GitHub Secrets:**
- `SSH_PRIVATE_KEY`: SSH key for server access
- `VPS_HOST`: Server IP address
- `VPS_USER`: Server username
- `VPS_APP_DIR`: Path to app-stack directory

See `deployment/README.md` for detailed setup instructions.

### Zero-Downtime Deployments

Achieved through Docker Compose's container recreation strategy:
- New Django container starts before old one stops
- Nginx Proxy Manager seamlessly switches traffic
- Database remains running (persistent volume)
- Health checks verify the new container before completion

### Static Assets Management

- Static files versioned using content hashes (WhiteNoise's `CompressedManifestStaticFilesStorage`)
- Built into Docker image during build (not at runtime)
- Efficiently cached while ensuring fresh deployments reference correct versions
- No separate CDN required - WhiteNoise serves static files efficiently

### Continuous Integration

GitHub Actions CI (`.github/workflows/ci.yml`) runs on every push/PR:
- Sets up PostgreSQL service container for testing
- Uses `uv` for fast dependency installation
- Runs database migrations in test environment
- Collects static files to catch configuration errors
- Executes full test suite: `uv run python manage.py test -v3`
- Provides immediate feedback on code quality

## Development Environment Setup

### Installing uv

This project uses [uv](https://github.com/astral-sh/uv) for package management and virtual environment handling. Install uv with:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Or on macOS with Homebrew:

```bash
brew install uv
```

### Setting Up the Development Environment

1. Create and sync the virtual environment with uv:

```bash
uv sync
```

This will:
- Create a virtual environment (if it doesn't exist)
- Install all dependencies from `pyproject.toml`
- Install the project in editable mode

2. Activate the virtual environment (uv will show you the path, or use):

```bash
source .venv/bin/activate  # On macOS/Linux
# or
source .venv/Scripts/activate  # On Windows
```

Alternatively, you can run commands directly with `uv run`:

```bash
uv run python manage.py migrate
uv run python manage.py runserver
```

### Adding or Updating Dependencies

To add a new dependency:

```bash
uv add package-name
```

To add a development dependency:

```bash
uv add --dev package-name
```

To update all dependencies:

```bash
uv sync --upgrade
```

To update a specific package:

```bash
uv add package-name@latest
```

### Running Tests

1. Set the `DATABASE_URL` environment variable to `postgres://testuser:testpass@localhost/taylorlearnsblog`.
2. Run tests from the repository root with:

```bash
uv run python manage.py test -v3
```

Or if the virtual environment is activated:

```bash
python manage.py test -v3
```

### Environment Variables

Key environment variables for configuration:
- `DATABASE_URL`: PostgreSQL connection string
- `DJANGO_SECRET`: Secret key for production
- `DJANGO_DEBUG`: Enable debug mode
- `SENTRY_DSN`: Error monitoring (optional)
- Cloudflare configuration: `CLOUDFLARE_EMAIL`, `CLOUDFLARE_TOKEN`, `CLOUDFLARE_ZONE_ID`

## Documentation Practices

Simon emphasizes comprehensive documentation:
- Treat projects as if you might forget every detail
- Use GitHub issues to document design decisions and project discussions
- Write thorough release notes for project updates
- This README serves as ongoing documentation of the project's evolution

## Additional Resources

For more insights into Simon Willison's blog development practices, see:
- [Simon's post on link blogging (December 2024)](https://simonwillison.net/2024/Dec/22/link-blog/)
- [Simon's blog tag on zero-downtime deployments](https://simonwillison.net/tags/zero-downtime/)
- [Blog posts on optimal workflows](https://simonwillison.net/tags/deployment/)
- [Simon's post on building his TIL blog from scratch](https://til.simonwillison.net/django/building-a-blog-in-django)
