"""
Utilities for fetching metadata from URLs for quotebacks.

This module provides functions to:
- Fetch the page title from a URL
- Fetch and download the favicon from a URL
- Extract author information if available

All assets are downloaded and stored locally to ensure permanence.
"""

import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from django.core.files.base import ContentFile
import logging

logger = logging.getLogger(__name__)

# User agent to avoid blocks from sites that block bots
USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
HEADERS = {"User-Agent": USER_AGENT}


def fetch_page_metadata(url, timeout=10):
    """
    Fetch metadata from a URL including title, author, and favicon.

    Args:
        url: The URL to fetch metadata from
        timeout: Request timeout in seconds

    Returns:
        dict with keys: title, author, favicon_url
        Returns empty strings if unable to fetch
    """
    metadata = {
        "title": "",
        "author": "",
        "favicon_url": "",
    }

    try:
        response = requests.get(url, headers=HEADERS, timeout=timeout)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, "html.parser")

        # Extract title
        metadata["title"] = _extract_title(soup, url)

        # Extract author
        metadata["author"] = _extract_author(soup)

        # Extract favicon URL
        metadata["favicon_url"] = _extract_favicon_url(soup, url)

    except Exception as e:
        logger.warning(f"Error fetching metadata from {url}: {e}")

    return metadata


def _extract_title(soup, url):
    """
    Extract the page title from HTML.

    Tries in order:
    1. Open Graph title (og:title)
    2. Twitter card title (twitter:title)
    3. Standard <title> tag
    """
    # Try Open Graph title
    og_title = soup.find("meta", property="og:title")
    if og_title and og_title.get("content"):
        return og_title["content"]

    # Try Twitter card title
    twitter_title = soup.find("meta", attrs={"name": "twitter:title"})
    if twitter_title and twitter_title.get("content"):
        return twitter_title["content"]

    # Try standard title tag
    title_tag = soup.find("title")
    if title_tag and title_tag.string:
        return title_tag.string.strip()

    # Fallback to URL
    return url


def _extract_author(soup):
    """
    Extract author information from HTML.

    Tries in order:
    1. Open Graph article:author
    2. Meta author tag
    3. Twitter card creator
    """
    # Try Open Graph article:author
    og_author = soup.find("meta", property="article:author")
    if og_author and og_author.get("content"):
        return og_author["content"]

    # Try standard meta author
    meta_author = soup.find("meta", attrs={"name": "author"})
    if meta_author and meta_author.get("content"):
        return meta_author["content"]

    # Try Twitter card creator
    twitter_creator = soup.find("meta", attrs={"name": "twitter:creator"})
    if twitter_creator and twitter_creator.get("content"):
        # Remove @ if present
        creator = twitter_creator["content"]
        return creator.lstrip("@")

    return ""


def _extract_favicon_url(soup, base_url):
    """
    Extract favicon URL from HTML.

    Tries in order:
    1. <link rel="icon">
    2. <link rel="shortcut icon">
    3. <link rel="apple-touch-icon">
    4. Default /favicon.ico
    """
    # Try standard icon link
    icon_link = soup.find("link", rel=lambda x: x and "icon" in x.lower())
    if icon_link and icon_link.get("href"):
        return urljoin(base_url, icon_link["href"])

    # Try apple-touch-icon
    apple_icon = soup.find("link", rel="apple-touch-icon")
    if apple_icon and apple_icon.get("href"):
        return urljoin(base_url, apple_icon["href"])

    # Fallback to default favicon.ico
    parsed = urlparse(base_url)
    return f"{parsed.scheme}://{parsed.netloc}/favicon.ico"


def download_favicon(favicon_url, timeout=10):
    """
    Download a favicon from a URL and return a ContentFile.

    Args:
        favicon_url: URL of the favicon to download
        timeout: Request timeout in seconds

    Returns:
        ContentFile with the favicon data, or None if download fails
    """
    try:
        response = requests.get(favicon_url, headers=HEADERS, timeout=timeout)
        response.raise_for_status()

        # Get filename from URL
        parsed = urlparse(favicon_url)
        filename = parsed.path.split("/")[-1]

        # If no extension, add .ico
        if "." not in filename:
            filename = "favicon.ico"

        return ContentFile(response.content, name=filename)

    except Exception as e:
        logger.warning(f"Error downloading favicon from {favicon_url}: {e}")
        return None
