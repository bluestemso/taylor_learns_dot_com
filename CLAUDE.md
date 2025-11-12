# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Django-based blog application built on foundations originally developed by Simon Willison. The blog supports multiple content types (entries, blogmarks, quotations, notes) with full-text search, tagging, and draft preview capabilities.

**Live site:** https://taylorlearns.com/

## Technology Stack

- **Django 5.1.4** - Web framework (settings in `config/settings.py`)
- **PostgreSQL** - Database with full-text search using `SearchVectorField` and GIN indexes
- **uv** - Python package and virtual environment manager (replaces pip/poetry)
- **Gunicorn** - Production WSGI server
- **WhiteNoise** - Static file serving with content hashing
- **Playwright** - End-to-end testing framework
- **Tailwind CSS v4** - Utility-first CSS framework
- **DaisyUI** - Component library for Tailwind with "lofi" (light) and "black" (dark) themes

## Development Commands

### Environment Setup

```bash
# Install Python dependencies and create virtual environment
uv sync

# Install Node.js dependencies (for Tailwind CSS)
npm install

# Activate virtual environment (if not using uv run)
source .venv/bin/activate  # macOS/Linux

# Add new Python dependency
uv add package-name

# Add development Python dependency
uv add --dev package-name

# Add new Node.js dependency
npm install --save-dev package-name
```

### Running the Application

```bash
# Run development server
uv run python manage.py runserver
# Or if venv activated:
python manage.py runserver

# Access at http://127.0.0.1:8000
```

### Database Management

```bash
# Run migrations
uv run python manage.py migrate

# Create new migration after model changes
uv run python manage.py makemigrations

# Access Django shell
uv run python manage.py shell

# Reindex search (after content changes)
uv run python manage.py reindex_all
```

### Working with Production Data Locally

To develop with a local copy of production data (all commands run locally):

```bash
# 1. Fetch production database (connects via SSH automatically)
./scripts/fetch-production-db.sh user@server ~/app-stack/taylor_learns_dot_com

# 2. Restore to local database
./scripts/restore-local-db.sh scripts/db_dump_2024-11-12.sql

# 3. Start development with production data
docker compose up -d          # Run everything in Docker
# OR
docker compose up -d postgres # PostgreSQL in Docker only
uv run python manage.py runserver  # Django runs locally
```

**Two development modes:**

- **Docker mode** (recommended): Both PostgreSQL and Django in Docker
  - `docker compose up -d` starts everything
  - Matches production environment exactly
  - Use `DB_HOST=postgres` in `.env`

- **Hybrid mode** (faster iteration): PostgreSQL in Docker, Django local
  - `docker compose up -d postgres` for database only
  - `uv run python manage.py runserver` for Django
  - Use `DB_HOST=localhost` in `.env`

See `scripts/README.md` for detailed documentation on database workflows.

### Testing

```bash
# Django tests (requires DATABASE_URL=postgres://postgres:@localhost/test_db)
uv run python manage.py test -v3

# Run single test
uv run python manage.py test blog.tests.TestClassName.test_method_name

# Playwright E2E tests (automatically starts dev server)
npm test                    # All tests headless
npm run test:ui            # Interactive UI mode
npm run test:headed        # With browser visible
npm run test:debug         # Step-through debugging
npm run test:design        # Design system tests only
npm run test:nav           # Mobile navigation tests only
npm run test:search        # Search functionality tests only
npm run test:responsive    # Responsive design tests only
npm run test:mobile        # Mobile Chrome only
npm run test:report        # View HTML report
```

### Static Files

```bash
# Build Tailwind CSS (required after template/style changes)
npm run build:css        # Production build (minified)
npm run watch:css        # Development mode (watches for changes)
npm run dev              # Alias for watch:css

# Collect static files (required before deployment)
uv run python manage.py collectstatic --noinput
```

## Code Architecture

### Project Structure

```
blog/               - Main blog app with content models and views
  ├── models.py     - Entry, Blogmark, Quotation, Note, Tag models (all inherit from BaseModel)
  ├── views.py      - View functions for content rendering
  ├── search.py     - Full-text search implementation using PostgreSQL
  ├── feeds.py      - RSS/Atom feed generation
  ├── admin.py      - Django admin customizations
  ├── templatetags/ - Custom template filters and tags
  └── management/commands/ - Custom management commands (import_blog_xml, reindex_all, etc.)

config/             - Django configuration
  ├── settings.py   - Main settings file
  ├── urls.py       - URL routing
  ├── hosts.py      - django-hosts configuration
  └── wsgi.py       - WSGI application entry point

templates/          - Django templates (NOT Jinja2)
  ├── base.html     - Base template with head/scripts
  ├── bighead.html  - Homepage and list pages layout (with large header)
  ├── smallhead.html - Blog post detail layout (with compact header)
  ├── entry.html    - Blog post content template
  ├── homepage.html - Homepage content
  └── includes/     - Reusable template components

static/             - Static assets
  └── css/
      ├── src/
      │   └── main.css      - Tailwind CSS input file with custom styles
      └── tailwind.css      - Generated Tailwind CSS output (built by npm run build:css)

tests/              - Playwright E2E tests
  ├── design-system.spec.js
  ├── mobile-navigation.spec.js
  ├── search.spec.js
  └── responsive.spec.js

redirects/          - URL redirect handling app
feedstats/          - Feed statistics tracking app
```

### Content Model Architecture

All content types inherit from `BaseModel` (in `blog/models.py`):

- **Entry** - Full blog posts with body text
- **Blogmark** - Link posts with commentary
- **Quotation** - Quoted excerpts with source
- **Note** - Short notes/microblog posts

Shared features via `BaseModel`:
- `created` - Timestamp
- `is_draft` - Draft mode for previewing unpublished content
- `slug` - URL-friendly identifier
- `tags` - Many-to-many relationship with Tag model
- Full-text search via `SearchVectorField` indexed with GIN

### Search Implementation

Full-text search is implemented in `blog/search.py`:
- Uses PostgreSQL's `SearchVectorField` with GIN indexes
- Supports tag-based filtering
- Results ranked by relevance
- Search index automatically updated via Django signals (`blog/signals.py`)

### URL Routing

- Main URLs in `config/urls.py`
- Legacy 2003-era URLs supported via `config/urls_2003.py` and `blog/views_2003.py`
- Uses `django-hosts` for subdomain routing (configured in `config/hosts.py`)
- Redirect middleware in `redirects/middleware.py` handles legacy URL patterns

### Template System

Templates use Django Template Language (NOT Jinja2):
- `base.html` includes design system CSS and common scripts
- `bighead.html` for homepage/archives (full-width header with search)
- `smallhead.html` for individual posts (compact header)
- Custom template tags in `blog/templatetags/` for rendering content

## Design System

### Frontend Architecture

The blog uses **Tailwind CSS v4 with DaisyUI**:

- **Framework:** Tailwind CSS v4 - Utility-first CSS framework
- **Component Library:** DaisyUI - Pre-built components (drawer, navbar, buttons, forms, badges, cards)
- **Themes:**
  - Light theme: "lofi" (default)
  - Dark theme: "black"
- **Typography:** Libre Franklin (sans-serif), IBM Plex Mono (monospace)
- **Layout:** DaisyUI drawer component with sidebar navigation, responsive mobile menu
- **Breakpoint:** 1024px (mobile vs desktop) using `lg:` prefix

### Key Design Files

- `FRONTEND_DESIGN_GUIDE.md` - Complete guide for making frontend changes
- `tailwind.config.js` - Tailwind configuration with DaisyUI plugin and themes
- `postcss.config.js` - PostCSS configuration for Tailwind processing
- `static/css/src/main.css` - Tailwind directives and custom CSS
- `static/css/tailwind.css` - Generated output file (don't edit directly)

### Making Design Changes

1. Edit templates using Tailwind utility classes and DaisyUI components
2. For custom styles, edit `static/css/src/main.css` (use `@layer` directives)
3. Build CSS: `npm run build:css` (or `npm run watch:css` during development)
4. Test across viewports: `npm run test:responsive`
5. Check design system compliance: `npm run test:design`
6. Mobile navigation: `npm run test:nav`

### Common DaisyUI Components Used

- **Drawer** - Sidebar navigation with mobile toggle (`bighead.html`, `smallhead.html`)
- **Navbar** - Mobile header bar
- **Menu** - Navigation menu items
- **Button** - Buttons and icon buttons (`.btn`, `.btn-primary`, `.btn-ghost`)
- **Form Controls** - Input fields (`.input`, `.input-bordered`)
- **Join** - Connected form elements (search bar)
- **Badge** - Tag badges (`.badge`, `.badge-primary`)
- **Card** - Content cards (`.card`, `.bg-base-200`)

### Tailwind Build Process

The CSS build happens in two contexts:

1. **Local Development:**
   ```bash
   npm run watch:css  # Watches templates for changes, rebuilds automatically
   ```

2. **Docker Build (Production):**
   - Dockerfile installs Node.js 20 LTS
   - Runs `npm ci` to install dependencies
   - Runs `npm run build:css` to generate minified CSS
   - Output included in `collectstatic` step

## Environment Variables

Key configuration (set in `.env` or environment):

```bash
DATABASE_URL=postgres://user:pass@localhost/dbname
DJANGO_SECRET=<secret-key-for-production>
DJANGO_DEBUG=True  # Set to False in production

# Optional
SENTRY_DSN=<sentry-error-tracking>
CLOUDFLARE_EMAIL=<cloudflare-account>
CLOUDFLARE_TOKEN=<cloudflare-api-token>
CLOUDFLARE_ZONE_ID=<cloudflare-zone>
```

## CI/CD

### Continuous Integration (CI)

`.github/workflows/ci.yml` runs on every push/PR:
1. Sets up PostgreSQL service container
2. Installs uv and Python 3.13
3. Runs `uv sync` to install dependencies
4. Runs migrations and collects static files
5. Executes Django test suite with `uv run python manage.py test -v3`

### Continuous Deployment (CD)

`.github/workflows/deploy.yml` automatically deploys to production:
1. Triggers on push to `main` branch (or manual trigger)
2. Connects to Hetzner VPS via SSH
3. Pulls latest code from GitHub
4. Builds new Docker image with updated code
5. Recreates Django container (zero-downtime deployment)
6. Runs database migrations
7. Performs health check

**Deployment Stack:**
- **Hosting:** Hetzner VPS
- **Orchestration:** Docker Compose
- **Reverse Proxy:** Nginx Proxy Manager (handles SSL/TLS)
- **Web Server:** Gunicorn (4 workers, 2 threads each)
- **Static Files:** WhiteNoise with content hashing (no CDN required)
- **Database:** PostgreSQL 15 (in Docker container with persistent volume)

**Required GitHub Secrets:**
- `SSH_PRIVATE_KEY`: SSH key for server access
- `VPS_HOST`: Server IP address
- `VPS_USER`: Server username
- `VPS_APP_DIR`: Path to app-stack directory

**Zero-Downtime Strategy:**
- New Docker container starts before old one stops
- Database runs continuously (not recreated during deploys)
- Health checks verify service is ready before marking deployment complete

See `deployment/README.md` for detailed deployment documentation.

## Custom Management Commands

Located in `blog/management/commands/`:

```bash
# Import blog content from XML
uv run python manage.py import_blog_xml path/to/file.xml

# Import blog content from JSON
uv run python manage.py import_blog_json path/to/file.json

# Import Quora answers
uv run python manage.py import_quora path/to/file.json

# Rebuild search index for all content
uv run python manage.py reindex_all

# Validate entries XML
uv run python manage.py validate_entries_xml
```

## Draft Mode

All content models support draft mode:
- Set `is_draft=True` to preview content without publishing
- Draft content requires `?draft` query parameter or authentication
- Useful for reviewing posts before they go live

## Testing Strategy

### Django Tests (`blog/tests.py`)
- Model tests for Entry, Blogmark, Quotation, Note, Tag
- View tests for rendering and URL routing
- Search functionality tests
- Run with: `uv run python manage.py test -v3`

### Playwright E2E Tests (`tests/`)
- Design system verification (colors, typography, layout)
- Mobile navigation and hamburger menu
- Search bar UI and functionality
- Responsive design across viewports (mobile/tablet/desktop)
- 37 tests × 5 browsers/devices = 185 test runs
- See `tests/README.md` for detailed documentation

## Dependencies Management

This project uses **uv** instead of pip/poetry:

```bash
# Update all dependencies
uv sync --upgrade

# Update specific package
uv add package-name@latest

# Lock file is uv.lock (committed to repo)
# Project config in pyproject.toml
```

**Note:** `package = false` is set in `[tool.uv]` because this is a Django application, not an installable Python package.

## Django Admin

Access at `/admin/` after creating superuser:

```bash
uv run python manage.py createsuperuser
```

Custom admin in `blog/admin.py` provides:
- Bulk tagging interface
- Draft mode toggle
- Search index management
- Custom list displays and filters

## Database Notes

- Uses PostgreSQL-specific features (full-text search, GIN indexes, JSONField)
- Database URL format: `postgres://user:password@host:port/database`
- Test database: `postgres://postgres:@localhost/test_db` (used in CI)
- Migrations in `blog/migrations/`

## Common Workflows

### Adding a New Blog Post Type

1. Add model to `blog/models.py` inheriting from `BaseModel`
2. Create migration: `uv run python manage.py makemigrations`
3. Run migration: `uv run python manage.py migrate`
4. Add to admin in `blog/admin.py`
5. Create template in `templates/`
6. Add URL pattern in `config/urls.py`
7. Add view in `blog/views.py`
8. Update search in `blog/search.py` if needed

### Updating the Design System

1. Read `FRONTEND_DESIGN_GUIDE.md` for current system
2. Edit `static/css/design-system.css`
3. Run `uv run python manage.py collectstatic`
4. Test with Playwright: `npm run test:design`
5. Test responsiveness: `npm run test:responsive`
6. Update `FRONTEND_DESIGN_GUIDE.md` if changing patterns

### Deploying to Production

**Automatic Deployment (Recommended):**
1. Run tests locally: `uv run python manage.py test -v3`
2. Run E2E tests: `npm test`
3. Commit changes: `git add . && git commit -m "Your message"`
4. Push to main: `git push origin main`
5. GitHub Actions automatically deploys to Hetzner VPS

**Manual Deployment (if needed):**
1. SSH into server: `ssh user@your-vps-ip`
2. Navigate to repo: `cd /path/to/taylor_learns_dot_com`
3. Pull latest code: `git pull origin main`
4. Build Docker image: `docker compose build django`
5. Recreate container: `docker compose up -d --no-deps --force-recreate django`
6. Run migrations: `docker compose exec django uv run python manage.py migrate --noinput`

See `.github/workflows/deploy.yml` and `deployment/README.md` for details.

## Additional Documentation

- `README.md` - Full project documentation and development practices
- `FRONTEND_DESIGN_GUIDE.md` - Frontend design system guide
- `tests/README.md` - Playwright testing documentation
- `scripts/README.md` - Database dump/restore workflows for local development
