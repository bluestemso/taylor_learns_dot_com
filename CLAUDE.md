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
- **Tailwind CSS** - Frontend styling (config available but uses custom CSS system)

## Development Commands

### Environment Setup

```bash
# Install dependencies and create virtual environment
uv sync

# Activate virtual environment (if not using uv run)
source .venv/bin/activate  # macOS/Linux

# Add new dependency
uv add package-name

# Add development dependency
uv add --dev package-name
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
      └── design-system.css - Main stylesheet with CSS custom properties

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

The blog uses a **custom CSS design system** with CSS custom properties (variables), NOT Tailwind in production:

- **Main stylesheet:** `static/css/design-system.css`
- **Color theme:** Blue accent (#0066cc primary)
- **Typography:** Libre Franklin (sans-serif), IBM Plex Mono (monospace)
- **Layout:** Fixed sidebar (223px) with responsive mobile hamburger menu
- **Breakpoint:** 1024px (mobile vs desktop)

### Key Design Files

- `DESIGN_SYSTEM.md` - Complete design system reference (originally based on Tom Critchlow's design)
- `FRONTEND_DESIGN_GUIDE.md` - Guide for making frontend changes
- `tailwind.config.js` - Tailwind config (reference only, not used in production)
- `static/css/design-system.css` - All CSS with custom properties and utility classes

### Making Design Changes

1. Edit `static/css/design-system.css` directly
2. Test across viewports using Playwright tests: `npm run test:responsive`
3. Check design system compliance: `npm run test:design`
4. Mobile navigation: `npm run test:nav`

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

### GitHub Actions

`.github/workflows/ci.yml` runs on every push/PR:
1. Sets up PostgreSQL service
2. Installs uv and Python 3.13
3. Runs `uv sync` to install dependencies
4. Runs migrations and collects static files
5. Executes Django test suite with `uv run python manage.py test -v3`

### Deployment

- Uses `Procfile` for Heroku-style deployment
- WhiteNoise serves static files with content hashing (no CDN required for static assets)
- Static files versioned using `CompressedManifestStaticFilesStorage`
- Zero-downtime deployment strategy (new processes start before old ones stop)

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

1. Run tests: `uv run python manage.py test -v3`
2. Run E2E tests: `npm test`
3. Collect static files: `uv run python manage.py collectstatic --noinput`
4. Set environment variables (DJANGO_SECRET, DATABASE_URL, etc.)
5. Run migrations: `uv run python manage.py migrate`
6. Deploy with `Procfile` (Heroku/similar platforms)

## Additional Documentation

- `README.md` - Full project documentation and development practices
- `DESIGN_SYSTEM.md` - Complete design system reference
- `FRONTEND_DESIGN_GUIDE.md` - Frontend modification guide
- `TAILWIND_SETUP.md` - Tailwind configuration notes (reference only)
- `tests/README.md` - Playwright testing documentation
- `deployment/README.md` - Deployment-specific documentation
