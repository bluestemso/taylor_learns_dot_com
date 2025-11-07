# Tailwind CSS Setup Guide

This guide explains how to use the Tailwind CSS configuration that matches the Tom Critchlow blog design system.

## Files

- `tailwind.config.js` - Tailwind configuration with custom colors, fonts, and utilities
- `tailwind-base.css` - Base styles and component classes using Tailwind directives

## Installation

1. Install Tailwind CSS and dependencies:
```bash
npm install -D tailwindcss postcss autoprefixer
```

2. Initialize Tailwind (if needed):
```bash
npx tailwindcss init -p
```

3. Replace the generated `tailwind.config.js` with the provided config file.

4. Import the base CSS file in your main stylesheet or Django template:
```css
@import './tailwind-base.css';
```

Or in your Django base template:
```html
{% load static %}
<link href="{% static 'css/tailwind-base.css' %}" rel="stylesheet">
```

## Usage Examples

### Colors

```html
<!-- Primary green text -->
<p class="text-newgreen">Green text</p>

<!-- Green background -->
<div class="bg-newgreen">Green background</div>

<!-- Green border -->
<div class="border-4 border-bright-green">Bright green border</div>

<!-- Near white background (navigation) -->
<nav class="bg-near-white">Navigation</nav>
```

### Typography

```html
<!-- H1 (matches f2 fw8 lh-solid) -->
<h1 class="text-f2 font-extrabold lh-solid">Title</h1>

<!-- H2 Subtitle (matches f3 fw3 italic) -->
<h2 class="text-f3 font-light italic subtitle">Subtitle</h2>

<!-- Body text (matches f4 lh-copy) -->
<p class="text-f4 lh-copy">Body text</p>

<!-- Date (matches f6 ibmplexmono ttu) -->
<div class="text-f6 font-ibmplexmono uppercase">January 1, 2024</div>

<!-- Monospace -->
<code class="font-mono">Code text</code>
```

### Layout

```html
<!-- Sidebar layout -->
<div class="flex">
  <aside class="w-[223px] fixed h-screen bg-near-white">Sidebar</aside>
  <main class="sidebar-layout">Content</main>
</div>

<!-- Content width (two-thirds on desktop) -->
<div class="content-width pt-16 pb-8">
  <!-- Content -->
</div>

<!-- Max width container -->
<div class="max-w-mw8 mx-auto">Content</div>
```

### Links

```html
<!-- Standard link with hover effect -->
<a href="#" class="link">Link text</a>

<!-- Black link with green hover -->
<a href="#" class="link-black">Link text</a>
```

### Components

```html
<!-- Post container -->
<article class="postcontainer">
  <h2>Heading</h2>
  <p>Content...</p>
</article>

<!-- Date header -->
<div class="date-header">January 1, 2024</div>

<!-- Post title -->
<h1 class="post-title">Post Title</h1>

<!-- Subtitle -->
<h2 class="subtitle">Subtitle text</h2>

<!-- Blockquote -->
<blockquote>Quote text</blockquote>

<!-- Code block -->
<pre class="code-block">Code here</pre>
```

### Navigation

```html
<!-- Nav item -->
<a href="#" class="nav-item">
  <i data-feather="home"></i>
  <span>Home</span>
</a>

<!-- Active nav item -->
<a href="#" class="nav-item active">Active</a>
```

### Responsive Design

```html
<!-- Mobile: full width, Desktop: two-thirds -->
<div class="w-full lg:w-two-thirds mx-auto">Content</div>

<!-- Mobile: padding, Desktop: no padding -->
<div class="px-3 lg:px-0">Content</div>

<!-- Mobile: block, Desktop: none -->
<div class="block lg:hidden">Mobile only</div>

<!-- Mobile: none, Desktop: block -->
<div class="hidden lg:block">Desktop only</div>
```

### Custom Utilities

```html
<!-- Uppercase text -->
<div class="ttu">UPPERCASE</div>

<!-- Letter spacing -->
<div class="tracked">Spaced text</div>

<!-- Green dot -->
<span class="greendot"></span>

<!-- Green timeline -->
<div class="relative">
  <div class="greentimeline"></div>
  <!-- Timeline items -->
</div>
```

## Breakpoints

- `mobile`: max-width 1023px (use with `max:` prefix or `lg:` for min-width)
- `lg`: min-width 1024px (desktop)
- Standard Tailwind breakpoints: `sm`, `md`, `lg`, `xl`, `2xl`

## Color Reference

- `newgreen`: #02AD28 (primary green)
- `bright-green`: #00ff00 (bright green)
- `newgreen-light`: #e6f4ea (light green background)
- `tcblack`: #212121 (text black)
- `bg-white`: #fffff8 (off-white background)
- `near-white`: #f3f3f3 (light gray)
- `black-50`: rgba(0,0,0,0.5) (secondary text)
- `black-10`: rgba(0,0,0,0.1) (subtle borders)
- `black-20`: rgba(0,0,0,0.2) (form borders)

## Font Reference

- `font-sans`: Libre Franklin (default)
- `font-serif`: Palatino, Georgia, serif
- `font-mono` / `font-ibmplexmono`: IBM Plex Mono
- `font-mono-alt`: Inconsolata
- `font-code`: Consolas, Menlo, Courier

## Migration from Tachyons

If you're migrating from Tachyons CSS classes, here's a quick reference:

| Tachyons | Tailwind Equivalent |
|----------|-------------------|
| `f2` | `text-f2` |
| `fw8` | `font-extrabold` |
| `lh-copy` | `lh-copy` |
| `ttu` | `ttu` |
| `w-two-thirds-ns` | `lg:w-two-thirds` |
| `ph3` | `px-3` |
| `pv4` | `py-4` |
| `bg-newgreen` | `bg-newgreen` |
| `b--newgreen` | `border-newgreen` |
| `mw8` | `max-w-mw8` |
| `center` | `mx-auto` |

## Django Integration

### settings.py

```python
STATIC_URL = '/static/'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]
```

### Base Template

```html
{% load static %}
<!DOCTYPE html>
<html lang="en">
<head>
    <link href="https://fonts.googleapis.com/css?family=Libre+Franklin:400,400italic,600,700,300,800|IBM+Plex+Mono|Inconsolata:400,700" rel="stylesheet">
    <link href="{% static 'css/tailwind-base.css' %}" rel="stylesheet">
</head>
<body>
    <!-- Your content -->
</body>
</html>
```

### Build Process

If using PostCSS:

```javascript
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

Then build:
```bash
npx tailwindcss -i ./static/css/input.css -o ./static/css/tailwind-base.css --watch
```

## Notes

- The config includes custom plugins for Tachyons-like utilities
- Base font size is set to 15px (matching original)
- The 1024px breakpoint is key for mobile/desktop switching
- Sidebar width is 223px (use `w-[223px]` or the `sidebar` spacing token)
- Content width is 66.67% on desktop (use `w-two-thirds`)

