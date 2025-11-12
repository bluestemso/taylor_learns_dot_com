# Frontend Design System Guide
## Taylor Learns Blog

This guide outlines how to make changes to the front-end design of the Taylor Learns blog using **Tailwind CSS v4** and **DaisyUI**.

---

## Table of Contents

1. [Design System Overview](#design-system-overview)
2. [Technology Stack](#technology-stack)
3. [File Structure](#file-structure)
4. [Getting Started](#getting-started)
5. [Themes](#themes)
6. [DaisyUI Components](#daisyui-components)
7. [Customization](#customization)
8. [Common Modifications](#common-modifications)
9. [Responsive Design](#responsive-design)
10. [Best Practices](#best-practices)

---

## Design System Overview

The Taylor Learns blog uses **Tailwind CSS v4** with **DaisyUI** component library:

- **Tailwind CSS v4**: Utility-first CSS framework for rapid UI development
- **DaisyUI**: Component library providing pre-built, themeable components
- **Themes**: "lofi" (light) and "black" (dark) themes
- **Mobile-first responsive design** with 1024px breakpoint (`lg:` prefix)

### Core Principles

1. **Utility-First**: Use Tailwind utility classes directly in templates
2. **Component-Based**: Leverage DaisyUI components for common UI patterns
3. **Responsive**: Mobile-first design with responsive modifiers
4. **Themeable**: Use DaisyUI theme system for consistent colors
5. **Performance**: CSS is purged and minified for production

---

## Technology Stack

### Build Tools

- **Tailwind CSS CLI** - Builds CSS from templates
- **PostCSS** - Processes CSS with autoprefixer
- **npm** - Manages Node.js dependencies

### Configuration Files

- `static/css/src/main.css` - Tailwind and DaisyUI configuration (using v4 CSS-first approach)
- `postcss.config.js` - PostCSS configuration
- `package.json` - Node.js dependencies and build scripts

---

## File Structure

```
static/css/
  ├── src/
  │   └── main.css              # Tailwind v4 config + DaisyUI plugin + custom CSS
  └── tailwind.css              # Generated output (don't edit)

templates/
  ├── base.html                 # Base template with <head>, scripts
  ├── bighead.html              # Homepage/list layout with drawer
  ├── smallhead.html            # Blog post detail layout with drawer
  ├── entry.html                # Blog entry content
  ├── homepage.html             # Homepage content
  └── includes/
      ├── search_bar.html       # Search form component
      └── ...

postcss.config.js               # PostCSS configuration
package.json                    # npm scripts and dependencies
```

---

## Getting Started

### Initial Setup

```bash
# Install Node.js dependencies
npm install

# Build CSS for production (minified)
npm run build:css

# Watch for changes during development
npm run watch:css
```

### Development Workflow

1. Edit templates (`.html` files) using Tailwind utilities
2. For custom styles, edit `static/css/src/main.css`
3. Run `npm run watch:css` to auto-rebuild on changes
4. Refresh browser to see updates

### Building for Production

```bash
# Build minified CSS
npm run build:css

# Collect static files for Django
uv run python manage.py collectstatic --noinput
```

---

## Themes

### Available Themes

The blog uses two DaisyUI themes:

1. **lofi** (default light theme)
   - Clean, minimal design
   - High contrast
   - Subtle colors

2. **black** (dark theme)
   - Dark background
   - Light text
   - High contrast

### Setting the Theme

Themes are set via the `data-theme` attribute in `base.html`:

```html
<html lang="en-gb" data-theme="lofi">
```

To switch themes:
- Change `data-theme="lofi"` to `data-theme="black"`
- Or implement theme toggle with JavaScript

### Theme Colors

DaisyUI provides semantic color classes:

- `primary` - Primary brand color
- `secondary` - Secondary color
- `accent` - Accent color
- `neutral` - Neutral colors
- `base-100`, `base-200`, `base-300` - Background colors
- `info`, `success`, `warning`, `error` - Status colors

Use in templates:
```html
<div class="bg-primary text-primary-content">Primary background</div>
<button class="btn btn-secondary">Secondary button</button>
```

---

## DaisyUI Components

### Components in Use

#### 1. Drawer (Sidebar Navigation)

Used in `bighead.html` and `smallhead.html` for sidebar navigation.

```html
<div class="drawer lg:drawer-open">
  <input id="sidebar-drawer" type="checkbox" class="drawer-toggle" />

  <!-- Main content -->
  <div class="drawer-content">
    <!-- Your page content -->
  </div>

  <!-- Sidebar -->
  <div class="drawer-side">
    <label for="sidebar-drawer" class="drawer-overlay"></label>
    <aside class="bg-base-200 min-h-screen w-64">
      <!-- Sidebar content -->
    </aside>
  </div>
</div>
```

**Key features:**
- `lg:drawer-open` - Always open on desktop (≥1024px)
- Slides in/out on mobile via checkbox toggle
- Overlay closes drawer when clicked

#### 2. Navbar (Mobile Header)

Mobile-only header with hamburger menu toggle.

```html
<div class="navbar bg-base-200 lg:hidden">
  <div class="flex-none">
    <label for="sidebar-drawer" class="btn btn-square btn-ghost">
      <!-- Hamburger icon SVG -->
    </label>
  </div>
  <div class="flex-1">
    <h1 class="text-xl font-extrabold">Taylor Learns</h1>
  </div>
</div>
```

#### 3. Menu (Navigation Links)

Used inside the drawer for navigation items.

```html
<nav class="menu">
  <li><a href="/" class="menu-item">Home</a></li>
  <li><a href="/about/" class="menu-item">About</a></li>
  <li><a href="/tags/" class="menu-item">Tags</a></li>
</nav>
```

#### 4. Form Controls (Search Bar)

Search input with joined button (`includes/search_bar.html`).

```html
<form action="/search/" method="GET">
  <div class="join w-full">
    <input type="search"
           class="input input-bordered join-item flex-1"
           name="q"
           placeholder="Search this site">
    <button type="submit" class="btn btn-primary join-item">
      <!-- Search icon -->
    </button>
  </div>
</form>
```

#### 5. Badge (Tags)

Used for displaying tags.

```html
<a href="/tags/{{ tag }}/" class="badge badge-primary badge-outline">
  {{ tag }}
</a>
```

#### 6. Card (Content Containers)

Used for sidebar content and special sections.

```html
<div class="card bg-base-200 p-6">
  <p>Card content here</p>
</div>
```

#### 7. Button

Various button styles for actions.

```html
<button class="btn">Default</button>
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-ghost">Ghost</button>
<button class="btn btn-square">Square</button>
```

---

## Customization

### Adding Custom CSS

Edit `static/css/src/main.css` to add custom styles.

**Note:** Tailwind v4 uses a new CSS-first configuration approach with `@import` and `@theme` instead of JavaScript config files.

```css
@import "tailwindcss";
@plugin "daisyui";

@theme {
  /* Custom theme configuration */
  --font-sans: "Libre Franklin", sans-serif;
  --font-mono: "IBM Plex Mono", monospace;
  --breakpoint-lg: 1024px;

  /* Add custom colors, spacing, etc. */
  --color-custom-blue: #0066cc;
}

/* Use @layer to organize custom styles */
@layer base {
  /* Custom base styles */
  html {
    font-size: 15px;
  }
}

@layer components {
  /* Custom component classes */
  .my-custom-component {
    @apply bg-primary text-white p-4 rounded;
  }
}

@layer utilities {
  /* Custom utility classes */
  .text-balance {
    text-wrap: balance;
  }
}
```

**After editing, rebuild:**
```bash
npm run build:css
```

### Configuring DaisyUI Themes

DaisyUI configuration is done through the `@plugin` directive in your CSS file. The available themes are configured when you import the plugin:

```css
@plugin "daisyui";
```

To switch between "lofi" (light) and "black" (dark) themes, change the `data-theme` attribute in `templates/base.html`:

```html
<html lang="en-gb" data-theme="lofi">  <!-- or data-theme="black" -->
```

### Changing Fonts

Fonts are loaded in `base.html` and configured in `static/css/src/main.css`.

**To change fonts:**

1. Update Google Fonts link in `base.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Your+Font:wght@400;700&display=swap" rel="stylesheet">
```

2. Update `static/css/src/main.css` in the `@theme` section:
```css
@theme {
  --font-sans: "Your Font", sans-serif;
  --font-mono: "Your Mono Font", monospace;
}
```

3. Rebuild CSS: `npm run build:css`

---

## Common Modifications

### Changing Colors

**Option 1: Use DaisyUI theme colors**

Just use semantic classes like `bg-primary`, `text-secondary`, etc.

**Option 2: Create custom DaisyUI theme**

Edit `tailwind.config.js`:

```javascript
daisyui: {
  themes: [
    {
      mytheme: {
        "primary": "#0066cc",
        "secondary": "#00a0ff",
        "accent": "#6b2d8a",
        "neutral": "#212121",
        "base-100": "#fffff8",
        "info": "#3abff8",
        "success": "#36d399",
        "warning": "#fbbd23",
        "error": "#f87272",
      },
    },
  ],
}
```

Then set `data-theme="mytheme"` in `base.html`.

### Modifying Layout

**Sidebar width:**

Edit the drawer aside in `bighead.html`:

```html
<aside class="bg-base-200 min-h-screen w-80">  <!-- Changed from w-64 -->
```

**Max content width:**

Edit the container in `bighead.html`:

```html
<div class="container mx-auto px-4 py-6 lg:py-8 max-w-5xl">  <!-- Changed from max-w-4xl -->
```

**Mobile breakpoint:**

Tailwind's `lg:` prefix is 1024px by default. To change:

```javascript
// tailwind.config.js
theme: {
  extend: {
    screens: {
      'lg': '1280px',  // Change breakpoint
    },
  },
}
```

### Updating Typography

**Font sizes:**

Use Tailwind's text size utilities:
- `text-xs` - 0.75rem
- `text-sm` - 0.875rem
- `text-base` - 1rem
- `text-lg` - 1.125rem
- `text-xl` - 1.25rem
- `text-2xl` - 1.5rem
- `text-3xl` - 1.875rem
- `text-4xl` - 2.25rem

**Font weights:**
- `font-light` - 300
- `font-normal` - 400
- `font-medium` - 500
- `font-semibold` - 600
- `font-bold` - 700
- `font-extrabold` - 800

**Line heights:**
- `leading-none` - 1
- `leading-tight` - 1.25
- `leading-snug` - 1.375
- `leading-normal` - 1.5
- `leading-relaxed` - 1.625

### Adding Icons

DaisyUI works well with SVG icons. The templates use Heroicons.

```html
<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
</svg>
```

Resources:
- [Heroicons](https://heroicons.com/) - Used in templates
- [DaisyUI Icons](https://daisyui.com/docs/themes/) - Icon recommendations

---

## Responsive Design

### Mobile-First Approach

Tailwind uses mobile-first breakpoints. Write mobile styles first, then add responsive modifiers:

```html
<!-- Padding: 4 on mobile, 8 on large screens -->
<div class="p-4 lg:p-8">

<!-- Hidden on mobile, visible on large screens -->
<div class="hidden lg:block">

<!-- Full width on mobile, 2/3 width on large screens -->
<div class="w-full lg:w-2/3">
```

### Breakpoints

- Default (mobile): < 1024px
- `lg:` prefix: ≥ 1024px

### Common Responsive Patterns

**Responsive Grid:**
```html
<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>
```

**Responsive Text Sizes:**
```html
<h1 class="text-2xl lg:text-4xl">Responsive Heading</h1>
```

**Show/Hide on Mobile:**
```html
<div class="lg:hidden">Mobile only</div>
<div class="hidden lg:block">Desktop only</div>
```

---

## Best Practices

### 1. Use Tailwind Utilities

✅ **Good:**
```html
<div class="flex items-center justify-between p-4 bg-base-200 rounded-lg">
```

❌ **Avoid:**
```html
<div style="display: flex; padding: 1rem; background: #f3f3f3;">
```

### 2. Use DaisyUI Components

✅ **Good:**
```html
<button class="btn btn-primary">Click Me</button>
```

❌ **Avoid:**
```html
<button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Click Me</button>
```

### 3. Use Semantic Color Classes

✅ **Good:**
```html
<div class="bg-primary text-primary-content">
```

❌ **Avoid:**
```html
<div class="bg-blue-600 text-white">
```

### 4. Keep Custom CSS Minimal

Only add custom CSS when Tailwind utilities aren't sufficient. Use `@layer` directives to organize.

### 5. Build CSS After Template Changes

Always rebuild after editing templates:
```bash
npm run build:css
```

Or use watch mode during development:
```bash
npm run watch:css
```

### 6. Test Responsively

Test on multiple screen sizes:
- Mobile (< 1024px)
- Desktop (≥ 1024px)

Use browser DevTools or Playwright tests:
```bash
npm run test:responsive
```

### 7. Maintain Accessibility

- Use semantic HTML
- Ensure sufficient color contrast
- Add `aria-label` to icon buttons
- Test keyboard navigation

---

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [DaisyUI Documentation](https://daisyui.com/)
- [DaisyUI Components](https://daisyui.com/components/)
- [DaisyUI Themes](https://daisyui.com/docs/themes/)
- [Heroicons](https://heroicons.com/)

---

## Getting Help

- Check `CLAUDE.md` for project-specific guidelines
- Review existing templates for patterns
- Consult Tailwind/DaisyUI documentation
- Run Playwright tests to verify changes

**Questions?** Open an issue or check the documentation above.
