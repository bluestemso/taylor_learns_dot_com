# Frontend Design System Guide
## Taylor Learns Blog

This guide outlines how to make changes to the front-end design of the Taylor Learns blog. It provides documentation on the design system architecture, key files, and common modification patterns.

---

## Table of Contents

1. [Design System Overview](#design-system-overview)
2. [File Structure](#file-structure)
3. [Color Palette](#color-palette)
4. [Typography](#typography)
5. [Layout System](#layout-system)
6. [Common Modifications](#common-modifications)
7. [Component Reference](#component-reference)
8. [Responsive Design](#responsive-design)
9. [Best Practices](#best-practices)

---

## Design System Overview

The Taylor Learns blog uses a custom design system built with:
- **Custom CSS** with CSS custom properties (CSS variables)
- **Utility-first approach** inspired by Tachyons CSS
- **Mobile-first responsive design** with a 1024px breakpoint
- **Blue accent theme** (#0066cc primary color)

### Core Principles

1. **Consistency**: Use design tokens (CSS variables) for all colors, spacing, and typography
2. **Reusability**: Leverage utility classes for common patterns
3. **Maintainability**: Keep styles organized and well-commented
4. **Accessibility**: Ensure proper contrast, focus states, and semantic HTML

---

## File Structure

### Primary Files

```
static/css/
  └── design-system.css       # Main stylesheet with all design system styles

templates/
  ├── base.html               # Base template with head/scripts
  ├── bighead.html            # Homepage and list pages layout
  ├── smallhead.html          # Blog post detail layout
  ├── homepage.html           # Homepage content
  ├── entry.html              # Blog post content
  └── includes/
      └── search_bar.html     # Reusable search component
```

### Design Documentation

```
FRONTEND_DESIGN_GUIDE.md      # This guide (you're reading it!)
static/css/design-system.css  # Main stylesheet
```

---

## Color Palette

### CSS Variables

All colors are defined in `static/css/design-system.css` at the top in the `:root` selector:

```css
:root {
  /* Primary Colors - Blue Theme */
  --color-primary-blue: #0066cc;
  --color-bright-blue: #00a0ff;
  --color-light-blue: #e6f2ff;

  /* Text Colors */
  --color-text-black: #212121;
  --color-black-50: rgba(0, 0, 0, 0.5);
  --color-black-10: rgba(0, 0, 0, 0.1);
  --color-black-20: rgba(0, 0, 0, 0.2);

  /* Background Colors */
  --color-bg-white: #fffff8;     /* Off-white page background */
  --color-near-white: #f3f3f3;   /* Sidebar background */
}
```

### Changing the Primary Color

To change the primary color theme:

1. Open `static/css/design-system.css`
2. Find the `:root` selector at the top
3. Update these three variables:
   ```css
   --color-primary-blue: #YOUR_NEW_COLOR;
   --color-bright-blue: #YOUR_LIGHTER_VARIANT;
   --color-light-blue: #YOUR_BACKGROUND_TINT;
   ```
4. The legacy names (`--color-newgreen`, etc.) will inherit these values

### Utility Classes

```css
.newgreen          /* Blue text (legacy name, uses --color-primary-blue) */
.black             /* Primary text color */
.black-50          /* Secondary text (50% opacity) */

.bg-newgreen       /* Blue background */
.bg-white          /* White background */
.bg-near-white     /* Light gray background */

.b--newgreen       /* Blue border */
.b--black-10       /* Light gray border */
.b--black-20       /* Medium gray border */
```

---

## Typography

### Font Families

The design uses three Google Fonts:

```css
--font-sans: "Libre Franklin", sans-serif;      /* Body text, UI */
--font-mono: "IBM Plex Mono", monospace;        /* Dates, code */
--font-code: Consolas, "Liberation Mono", ...;  /* Code blocks */
```

**To change fonts:**
1. Update font URLs in `templates/base.html` (line 13)
2. Update CSS variables in `static/css/design-system.css`

### Font Size Scale

Based on Tachyons scale (15px base):

| Class | Size | Use Case |
|-------|------|----------|
| `.f1` | 3rem (48px) | Large headings |
| `.f2` | 2.25rem (36px) | Post titles |
| `.f3` | 1.5rem (24px) | Section headings |
| `.f4` | 1.25rem (20px) | Body text, subheadings |
| `.f5` | 1rem (16px) | Small headings |
| `.f6` | 0.875rem (14px) | Metadata, dates |
| `.f7` | 0.75rem (12px) | Smallest text |

### Font Weight Classes

```css
.fw3  /* 300 - Light */
.fw4  /* 400 - Regular */
.fw6  /* 600 - Semi-bold */
.fw7  /* 700 - Bold */
.fw8  /* 800 - Extra-bold */
```

### Line Height

```css
.lh-solid  /* 1.0 - Tight for headings */
.lh-copy   /* 1.6 - Readable for body text */
.lh-title  /* 1.2 - Medium for titles */
```

### Text Transforms

```css
.ttu       /* Text transform: uppercase */
.tracked   /* Letter spacing: 0.1em */
.i         /* Italic */
.b         /* Bold */
```

---

## Layout System

### Sidebar Navigation

The design features a fixed sidebar on desktop (≥1024px):

```css
.sidebar-nav {
  width: 223px;        /* Fixed sidebar width */
  position: fixed;
  height: 100vh;
}
```

Main content is offset:

```css
.sidebar-layout {
  margin-left: 223px;  /* Desktop: offset for sidebar */
}

@media (max-width: 1023px) {
  .sidebar-layout {
    margin-left: 0;    /* Mobile: no offset */
    margin-top: 60px;   /* Mobile: offset for fixed header */
  }
}
```

### Content Width

```css
.w-two-thirds-ns  /* 66.67% width on desktop (≥1024px) */
.center           /* Center with auto margins */
.mw8              /* Max width: 1024px */
```

### Spacing Scale

All spacing uses a consistent scale:

```css
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-5: 1.5rem;    /* 24px */
--spacing-6: 2rem;      /* 32px */
--spacing-7: 2.5rem;    /* 40px */
--spacing-8: 3rem;      /* 48px */
```

### Spacing Utilities

**Padding:**
```css
.pa0, .pa2, .pa3, .pa4, .pa5    /* All sides */
.ph0, .ph3                       /* Horizontal */
.pv2, .pv3, .pv4, .pv5          /* Vertical */
.pt4, .pt5                       /* Top */
.pb2, .pb4                       /* Bottom */
.pr3, .pl3                       /* Right, Left */
```

**Margin:**
```css
.ma0                             /* All sides: 0 */
.mt1, .mt2, .mt3, .mt4, .mt5    /* Top */
.mb2, .mb3, .mb4, .mb5          /* Bottom */
.mv1, .mv2                       /* Vertical */
.mh3                             /* Horizontal */
```

---

## Common Modifications

### Adjusting Feed Entry Spacing

Feed entries spacing is controlled in `static/css/design-system.css` under "Feed Entry Styles":

```css
.day, .segment, .entry, .blogmark, .quote, .note {
  padding: var(--spacing-6) 0;           /* Vertical padding */
  border-bottom: 2px solid var(--color-black-10);  /* Separator */
  margin-bottom: var(--spacing-6);       /* Space between entries */
}
```

**To increase spacing:**
```css
padding: var(--spacing-7) 0;      /* Change to spacing-7 or spacing-8 */
margin-bottom: var(--spacing-7);
```

### Changing Link Hover Effects

Link hover effects are defined in the "Links" section:

```css
a:hover {
  box-shadow: inset 0 -24px 0 rgba(0, 160, 255, 0.3);
}
```

**To change hover style:**
```css
/* Option 1: Underline */
a:hover {
  text-decoration: underline;
  box-shadow: none;
}

/* Option 2: Background color */
a:hover {
  background-color: var(--color-light-blue);
  box-shadow: none;
}

/* Option 3: Different shadow color/height */
a:hover {
  box-shadow: inset 0 -2px 0 var(--color-primary-blue);
}
```

### Modifying the Search Bar

Search bar styles are in the "Search Bar Styling" section:

```css
.search-input {
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-f7);
}

.search-submit {
  min-width: 40px;
  background-color: var(--color-primary-blue);
}
```

**To change appearance:**
- Adjust `min-width` to make button wider/narrower
- Change `font-size` for input text
- Modify `padding` for height
- Update icon in `.search-submit:before { content: "🔍"; }`

### Adjusting Mobile Breakpoint

The mobile/desktop breakpoint is 1024px. To change:

1. Search for `@media (max-width: 1023px)` in `design-system.css`
2. Search for `@media (min-width: 1024px)` in `design-system.css`
3. Update both to your desired breakpoint
4. Update the comment in `:root` that mentions "1024px breakpoint"

---

## Component Reference

### Navigation Items

```html
<a href="/" class="nav-item">
  <span class="navname">Home</span>
</a>
```

**Styling:**
```css
.nav-item {
  padding: var(--spacing-2);
  background-color: transparent;
  transition: background-color 0.2s;
}

.nav-item:hover {
  background-color: #fff;
}

.nav-item.active {
  background-color: #fff;
}
```

### Search Bar

Template: `templates/includes/search_bar.html`

```html
<form action="/search/" method="GET" class="search-form">
  <div class="search-form-wrapper">
    <input type="search" class="search-input" name="q">
    <input type="submit" class="search-submit" value="Search">
  </div>
</form>
```

### Post Title & Date Header

```html
<!-- Date Header -->
<div class="bb b--newgreen w-100 ibmplexmono ttu f6 dt-published mb5">
  January 1, 2025
</div>

<!-- Post Title -->
<h1 class="f2 fw8 lh-solid mv1 posttitle">Post Title</h1>
```

### Blockquotes

```css
blockquote {
  border-left: 4px solid var(--color-newgreen);
  padding-left: 10px;
  margin-left: 10px;
  font-style: italic;
}
```

### Code Blocks

```css
pre {
  background-color: black;
  color: white;
  padding: var(--spacing-4);
  overflow: scroll;
  font-size: 12px;
}
```

---

## Responsive Design

### Mobile-First Approach

The design is mobile-first with desktop enhancements at 1024px+.

### Key Responsive Patterns

**Desktop-only classes:**
```css
.ph0-l      /* No horizontal padding on large screens */
.pt5-l      /* Larger top padding on large screens */
.db-l       /* Display block on large screens */
.dn-l       /* Display none on large screens */
```

**Content width responsive:**
```css
.w-two-thirds-ns  /* 66.67% width on desktop, 100% on mobile */
```

### Mobile Navigation

On mobile (<1024px):
- Sidebar slides in from left
- Hamburger menu in top-right
- Dark overlay when menu is open
- Body scroll disabled when menu is open

**Key elements:**
```css
.hamburger-button    /* Three-line menu icon */
.mobile-header       /* Fixed top bar */
.mobile-overlay      /* Dark background overlay */
.sidebar-nav         /* Slides in/out with transform */
```

### Testing Responsive Design

1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test at these key widths:
   - 375px (iPhone SE)
   - 768px (iPad)
   - 1024px (Breakpoint)
   - 1440px (Desktop)

---

## Best Practices

### 1. Use Design Tokens

**Good:**
```css
.my-component {
  color: var(--color-primary-blue);
  padding: var(--spacing-4);
  font-family: var(--font-sans);
}
```

**Bad:**
```css
.my-component {
  color: #0066cc;
  padding: 16px;
  font-family: "Libre Franklin";
}
```

### 2. Prefer Utility Classes

**Good:**
```html
<div class="mb4 ph3 bg-near-white br2">Content</div>
```

**Bad:**
```html
<div style="margin-bottom: 1rem; padding: 0 0.75rem; background: #f3f3f3; border-radius: 0.25rem;">Content</div>
```

### 3. Add New Styles to design-system.css

When creating new components:

1. Add styles to the appropriate section in `design-system.css`
2. Use a comment header:
   ```css
   /* ==========================================================================
      Component Name
      ========================================================================== */
   ```
3. Use CSS variables for all values
4. Include responsive styles in the same section

### 4. Comment Complex Styles

```css
/* Mobile Sidebar Overlay */
.sidebar-nav.mobile-open {
  transform: translateX(0);  /* Slide in from left */
}
```

### 5. Test Across Devices

Before committing design changes:

- ✅ Test on desktop (≥1024px)
- ✅ Test on tablet (768px)
- ✅ Test on mobile (375px)
- ✅ Test hamburger menu functionality
- ✅ Test search bar on all sizes
- ✅ Test link hover states
- ✅ Check color contrast for accessibility

### 6. Version Control

When making design changes:

1. Work on a feature branch
2. Make incremental commits
3. Use descriptive commit messages:
   ```
   Update primary color to purple theme

   - Changed CSS variables for primary colors
   - Updated link hover effects
   - Modified search button background
   ```

---

## Quick Reference

### Most Common Tasks

| Task | File | Location |
|------|------|----------|
| Change primary color | `design-system.css` | `:root` selector, line ~13 |
| Adjust feed spacing | `design-system.css` | "Feed Entry Styles" section |
| Modify link hover | `design-system.css` | "Links" section |
| Update fonts | `base.html`, `design-system.css` | Font links, CSS variables |
| Change sidebar width | `design-system.css` | `--sidebar-width` variable |
| Adjust mobile breakpoint | `design-system.css` | All `@media` queries |
| Modify search bar | `design-system.css` | "Search Bar Styling" section |
| Update navigation | `bighead.html`, `smallhead.html` | Sidebar nav section |

### Design System Resources

- **Main stylesheet**: `static/css/design-system.css`
- **Color palette**: `:root` selector in `design-system.css`
- **Utility classes**: Throughout `design-system.css`
- **Component styles**: Organized sections in `design-system.css`

---

## Troubleshooting

### Issue: Styles not applying

1. Clear browser cache (Ctrl+Shift+R)
2. Check if Django static files are collected: `python manage.py collectstatic`
3. Verify CSS file is loaded in browser DevTools Network tab
4. Check for CSS syntax errors in DevTools Console

### Issue: Mobile menu not working

1. Check JavaScript console for errors
2. Verify hamburger button has `id="hamburger-btn"`
3. Ensure sidebar has class `sidebar-nav`
4. Check that overlay has `id="mobile-overlay"`
5. Verify `base.html` includes the JavaScript at the bottom

### Issue: Search bar wrapping

1. Check `.search-form` has `align-items: stretch`
2. Verify `.search-input` has `min-width: 0` and `flex: 1`
3. Ensure `.search-submit` has `flex-shrink: 0`
4. Check no extra whitespace in template between input and button

### Issue: Spacing inconsistent

1. Use CSS variables from `:root`, not hardcoded values
2. Check for inline styles in templates overriding CSS
3. Verify utility classes are spelled correctly
4. Check browser DevTools Computed styles to see what's applied

---

## Getting Help

If you need to make design changes and aren't sure how:

1. Search this guide for relevant sections
2. Look at similar existing components in `design-system.css`
3. Use browser DevTools to inspect existing elements
4. Check `DESIGN_SYSTEM.md` for the original design specifications
5. Test changes in browser DevTools before editing CSS files

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2025-11-07 | Initial design system guide created | Claude |
| 2025-11-07 | Blue theme implementation | Claude |
| 2025-11-07 | Mobile hamburger menu added | Claude |
| 2025-11-07 | Search bar icon implementation | Claude |
| 2025-11-10 | Removed Tailwind references, simplified guide | Claude |

---

*Last updated: November 10, 2025*
