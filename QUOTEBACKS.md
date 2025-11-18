# Quotebacks Feature

## Overview

The Quotebacks feature allows you to create rich, permanent quotes from other websites with automatically fetched metadata. Inspired by [the Quotebacks project](https://github.com/Blogger-Peer-Review/quotebacks), this implementation stores all metadata locally to ensure your quotes remain intact even if the source website goes offline.

## Key Features

- **Automatic Metadata Fetching**: Automatically fetches and stores:
  - Page title (from Open Graph, Twitter Card, or `<title>` tag)
  - Author name (if available from meta tags)
  - Favicon (downloaded and saved locally)

- **Permanent Storage**: All assets are stored on your server, ensuring permanence even if the source site disappears

- **Rich Display**: Beautiful card-based design with:
  - Quoted text with markdown support
  - Source page title and link
  - Favicon display
  - Optional author attribution
  - Optional commentary section

- **Full Integration**: Quotebacks are:
  - Searchable (full-text search)
  - Taggable (supports all tag features)
  - Draftable (preview before publishing)
  - RSS-feedable (included in feeds)

## How to Use

### Creating a Quoteback

1. Go to the Django admin at `/admin/`
2. Click on **Quotebacks** > **Add quoteback**
3. Fill in the required fields:
   - **Quote text**: The text you want to quote (supports Markdown)
   - **Source URL**: The URL of the page you're quoting from
   - **Slug**: URL-friendly identifier (auto-generated from page title)

4. Optional fields:
   - **Commentary**: Your thoughts on the quote (supports Markdown)
   - **Title**: Custom title for this quoteback post
   - **Fetch metadata**: Checkbox (enabled by default) - automatically fetches title, author, and favicon
   - **Page title**: Auto-filled from the source URL
   - **Author**: Auto-filled if available
   - **Favicon**: Auto-downloaded and saved
   - **Tags**: Add relevant tags
   - **Is draft**: Preview before publishing

5. Click **Save**

The system will automatically:
- Fetch the page title from the source URL
- Extract the author name if available
- Download and save the favicon locally
- Generate a slug if not provided
- Index the content for search

### Viewing a Quoteback

Quotebacks appear at URLs like:
```
/2024/Nov/18/example-slug/
```

They display with:
- The quoted text in a styled card
- Source information with favicon
- Optional commentary section
- Tags and metadata
- Edit link (for logged-in users)

### Searching Quotebacks

Quotebacks are fully searchable:
- Use the search bar to find quotes by content
- Filter by type: `type=quoteback`
- Filter by tags, year, month
- Full-text search across quote text, page title, author, and commentary

### Archive Views

Quotebacks appear in:
- Homepage feed
- Tag archive pages
- Year/month archive pages
- Search results
- RSS/Atom feeds

## Technical Details

### Model Structure

The `Quoteback` model inherits from `BaseModel` and includes:

```python
class Quoteback(BaseModel):
    quote_text = TextField()           # The quoted content
    source_url = URLField()            # Source page URL
    page_title = CharField()           # Page title (auto-fetched)
    author = CharField()               # Author name (auto-fetched, optional)
    favicon = ImageField()             # Favicon image (auto-fetched, stored locally)
    commentary = TextField()           # Your commentary (optional)
    title = CharField()                # Custom title (optional)
    # Inherits from BaseModel:
    # - created (timestamp)
    # - slug (URL identifier)
    # - tags (many-to-many)
    # - is_draft (boolean)
    # - search_document (full-text search)
```

### Metadata Fetching

The `quoteback_utils.py` module provides:

- `fetch_page_metadata(url)`: Fetches title, author, and favicon URL
  - Tries Open Graph tags first
  - Falls back to Twitter Card tags
  - Falls back to standard HTML tags

- `download_favicon(url)`: Downloads and returns a ContentFile
  - Handles various image formats
  - Stores in `media/quotebacks/favicons/`

### Template

The `quoteback.html` template displays:
- Quote in a styled blockquote
- Footer with favicon, page title link, and author
- Commentary section (if provided)
- Standard blog metadata (date, tags, etc.)

### CSS Styling

Quoteback-specific CSS classes in `design-system.css`:
- `.quoteback`: Main container with border and shadow
- `.quoteback-quote`: Styled blockquote for the quoted text
- `.quoteback-footer`: Footer with metadata
- `.quoteback-favicon`: Favicon display
- `.quoteback-cite`: Source citation styling
- `.quoteback-link`: Link to source
- `.quoteback-author`: Author attribution
- `.quoteback-commentary`: Commentary section

## Dependencies

- **Pillow**: Required for ImageField (favicon storage)
- **BeautifulSoup4**: For parsing HTML metadata
- **requests**: For fetching remote content

All dependencies are included in `pyproject.toml`.

## Database Migration

Migration `0031_quoteback.py` creates the Quoteback table and indexes.

Run migrations with:
```bash
uv run python manage.py migrate
```

## Future Enhancements

Potential improvements:
- Browser bookmarklet for quick quote capture
- Import from quotebacks.json export
- Bulk import from other sources
- Quote highlights/annotations
- Threading/conversation features
