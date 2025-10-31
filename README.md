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

Simon emphasizes the importance of automating deployments to ensure consistency and reliability. The deployment process should be executable with a single command, using tools like:
- **Fabric**: Python-based automation for deployment scripts
- **GitHub Actions**: Continuous integration (see `.github/workflows/ci.yml`)
- **Heroku**: Platform for hosting (based on the `Procfile` configuration)

### Zero-Downtime Deployments

Zero-downtime deployment strategies ensure continuous availability:
- New containers/processes start before old ones are stopped
- Traefik or similar load balancers handle seamless traffic transition
- Enables frequent and stress-free updates

### Rollback Mechanisms

Quick rollback capabilities are essential:
- Symlink switching keeps previous code versions accessible
- Allows for atomic deploys and immediate reversions
- Static asset versioning (MD5 hash in filenames) ensures correct asset references

### Static Assets Management

- Static files are versioned using content hashes (facilitated by WhiteNoise's `CompressedManifestStaticFilesStorage`)
- Assets are efficiently cached while ensuring fresh deployments reference correct versions
- WhiteNoise middleware handles static file serving in production

### Continuous Integration

The project includes GitHub Actions CI that:
- Runs tests on every push and pull request
- Sets up PostgreSQL database for testing
- Runs migrations and collects static files
- Executes the full test suite with `python manage.py test -v3`

## Development Environment Setup

### Running Tests

1. Set the `DATABASE_URL` environment variable to `postgres://testuser:testpass@localhost/simonwillisonblog`.
2. Run tests from the repository root with:

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
