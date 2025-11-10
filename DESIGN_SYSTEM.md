# Tom Critchlow Blog Design System

This document captures the design system used in tomcritchlow.com for reference when implementing similar designs in other frameworks (e.g., Django).

## Color Palette

### Primary Colors
- **Primary Green**: `#02AD28` (used for links, accents, borders)
- **Bright Green**: `#00ff00` (used for borders, highlights, decorative elements)
- **Text Black**: `#212121` (primary text color)
- **Background White**: `#fffff8` (page background, slightly off-white)
- **Near White**: `#f3f3f3` (light gray backgrounds, navigation background)
- **Light Green Background**: `#e6f4ea` (subtle green backgrounds)

### Semantic Colors
- **Link Color**: `#02AD28` (newgreen)
- **Link Hover**: Green highlight with `box-shadow: inset 0 -24px 0 rgba(0,255,0,0.4)`
- **Border Gray**: `#ccc` (subtle borders)
- **Text Gray**: `black-50` (secondary text, dates)
- **Code Background**: `black` (code blocks)
- **Code Text**: `white`

## Typography

### Font Families
- **Primary**: `"Libre Franklin"` (sans-serif, used for body text and UI)
- **Serif**: `Palatino, "Palatino Linotype", "Palatino LT STD", "Book Antiqua", Georgia, serif` (used in Tufte-style layouts)
- **Monospace**: `"IBM Plex Mono"` (used for dates, code, technical text)
- **Monospace Alt**: `'Inconsolata'` (alternative monospace)
- **Code**: `Consolas, "Liberation Mono", Menlo, Courier, monospace`

### Font Sizes (Tachyons CSS scale)
- Uses Tachyons CSS utility classes: `f1` through `f7`
- Base font size: `15px` (html)
- Body text: `1.1rem` (in post containers)
- Headings: `f2` (h1), `f3` (h2), `f4` (h3)
- Small text: `f6`, `f7`

### Typography Hierarchy
- **H1**: `f2 fw8 lh-solid` (large, bold, solid line-height)
- **H2**: `f3 fw3 lh-copy mt1 subtitle pb2` (medium, light weight, italic for subtitles)
- **H3**: `f4` (smaller headings)
- **Body**: `f4 lh-copy` (readable line-height)
- **Dates**: `f6 ibmplexmono ttu` (small, monospace, uppercase)

## Layout System

### Grid & Spacing
- Uses **Tachyons CSS** utility-first framework
- Max content width: `mw8` (max-width: 64rem / 1024px)
- Content width: `w-two-thirds-ns` (66% on desktop)
- Center alignment: `center` class
- Padding: `ph3 ph0-l` (horizontal padding on mobile, none on desktop)

### Navigation Layout
- **Sidebar Navigation**: Fixed left sidebar, 223px wide (`w5`)
- **Mobile Navigation**: Hamburger menu, full-width overlay
- **Breakpoint**: `1024px` (switches between sidebar and mobile menu)
- Navigation background: `bg-near-white` (`#f3f3f3`)
- Active nav item: `bg-white` background

### Content Layout
- Main content area: `margin-left: 223px` (to account for sidebar)
- Content container: `pt4 pt5-l pb2` (padding top responsive)
- Post container: `w-two-thirds-ns center` (centered, 66% width on desktop)

## Component Styles

### Links
```css
/* Default link styling */
- Color: #02AD28 (newgreen)
- Text-decoration: none
- Font-weight: bold
- Hover: Green highlight box-shadow effect
```

### Blockquotes
```css
- Border-left: 1px solid #02AD28
- Padding-left: 10px
- Margin-left: 10px
- Font-style: italic
```

### Code Blocks
```css
- Background: black
- Color: white
- Overflow: scroll
- Font-size: 12px
- Font-family: monospace
```

### Buttons & CTAs
- Contact boxes: `border: 4px solid #00ff00`, padding expands on hover
- Form inputs: `bg-light-gray`, `ba b--black-20`, rounded corners
- Submit buttons: `ba b--newgreen bg-light-gray`

### Images
- Max-width: 100%
- Padding: `pt3 pb3` (30px top/bottom)
- Responsive: `max-width: 100%` on mobile

## Special Features

### Sidenotes (Tufte-style)
- Float right in margin
- Numbered with CSS counters
- On mobile: Hidden by default, toggleable with checkbox
- Font-size: `0.9rem` or `1.1rem` depending on context
- Color: `#03a9f4` (blue) for sidenote numbers

### Green Accents
- **Green borders**: `4px solid #00ff00` or `1px solid #02AD28`
- **Green dots**: `10px x 10px` circles, `#02AD28` background
- **Green timeline**: Vertical line `1px solid #02AD28`
- **Dotted green arrow**: Dashed border with arrow indicators

### Post Metadata
- Date display: Monospace, uppercase, green border-bottom
- Format: `"January 1, 2024"` (no leading zeros)
- Styling: `bb b--newgreen w-100 ibmplexmono ttu f6`

## Responsive Design

### Breakpoints
- **Mobile**: `max-width: 1024px`
- **Tablet/Desktop**: `min-width: 1025px`

### Mobile Adaptations
- Sidebar becomes hamburger menu
- Content width: 100% (`w-100`)
- Padding: `ph3` (horizontal padding)
- Sidenotes: Hidden, toggleable
- Images: Full width
- Navigation: Sticky top bar with hamburger

### Desktop Features
- Fixed sidebar navigation
- Wider content area (66% of max-width)
- Sidenotes visible in margin
- More spacing (`pt5-l`)

## Design Principles

### Spacing
- Generous whitespace
- Consistent padding: `pv2`, `pv3`, `pv4`, `pv5` (vertical padding)
- Horizontal padding: `ph3` (mobile), `ph0-l` (desktop)

### Visual Hierarchy
- Clear typography scale
- Green accents for emphasis
- Subtle borders and backgrounds
- Monospace for metadata (dates, technical info)

### Interaction
- Hover effects on links (green highlight)
- Smooth transitions: `transition: ease-in .05s`
- Expandable elements (contact boxes)

### Content-First
- Wide reading width (55-66% of container)
- Generous line-height: `1.6em` for body text
- Serif fonts for long-form content (Tufte layout)
- Sans-serif for UI elements

## Utility Classes (Tachyons CSS)

The site heavily uses Tachyons CSS utility classes:
- Spacing: `pa`, `ph`, `pv`, `ma`, `mh`, `mv` (padding/margin)
- Width: `w-100`, `w-two-thirds-ns`, `mw8`
- Display: `flex`, `db`, `dn`, `db-l` (responsive display)
- Typography: `f1`-`f7`, `fw3`, `fw8`, `lh-copy`, `ttu`
- Colors: `newgreen`, `black`, `black-50`, `bg-near-white`, `bg-white`
- Borders: `ba`, `b--newgreen`, `b--black-10`, `br2`, `br3`
- Positioning: `fixed`, `relative`, `absolute`
- Alignment: `center`, `ml-auto`, `fr`

## Key Layout Patterns

### Blog Post Layout
```
- Fixed sidebar (223px) on left
- Main content area (margin-left: 223px)
- Post container: w-two-thirds-ns center
- Date header with green border-bottom
- Title: f2 fw8 lh-solid
- Subtitle: f3 fw3 italic
- Content: postcontainer class
- Footer with related posts
- Newsletter signup form
```

### Homepage Layout
```
- Same sidebar navigation
- Hero section: f4 lh-copy
- Latest Writing section: ttu f5 newgreen tracked b
- Post list: flex justify-between
- Projects section: Similar list format
```

### Navigation Structure
```
- Fixed sidebar: bg-near-white, 223px wide
- Main links: Home, About, Writing, Library, Newsletter, Search
- Grouped sections: "Hire me", "Elsewhere"
- Feather icons for each link
- Active state: bg-white background
- Mobile: Hamburger menu, full-width overlay
```

## CSS Files Structure

1. **all.css**: Main custom styles, colors, components
2. **tufte.css**: Tufte-style typography and layout (for long-form content)
3. **mobile.css**: Mobile-specific overrides
4. **tachyons.min.css**: Utility framework
5. **hamburgers.css**: Hamburger menu icon styles

## JavaScript Dependencies

- jQuery (`jquery-1.10.2.min.js`)
- Feather Icons (`feather.min.js`)
- jQuery UI (`jquery-ui.min.js`) - for slide animations
- Hypothesis (for annotations)
- Commento (for comments)

## Font Loading

Google Fonts:
- Libre Franklin: `400,400italic,600,700,300,800`
- IBM Plex Mono
- Inconsolata: `400,700`

## Example HTML Structure

### Blog Post
```html
<div class="pt4 pt5-l pb2 w-two-thirds-ns center">
  <div class="f4 ph3 pb4 ph0-l lh-copy">
    <div class="bb b--newgreen w-100 ibmplexmono ttu f6 dt-published mb5">
      January 1, 2024
    </div>
    <h1 class="f2 fw8 lh-solid mv1 posttitle">Post Title</h1>
    <h2 class="f3 fw3 lh-copy mt1 subtitle pb2 i">Subtitle</h2>
    <div class="postcontainer">
      <!-- Content -->
    </div>
  </div>
</div>
```

### Navigation Item
```html
<a class="db flex items-center mh3 pa2 bg-animate hover-bg-white link black br3 ttu" href="/about">
  <i data-feather="user" class="h1 pr3"></i>
  <span class="navname">About me</span>
</a>
```

## Design Tokens Summary

```javascript
{
  colors: {
    primaryGreen: "#02AD28",
    brightGreen: "#00ff00",
    textBlack: "#212121",
    backgroundWhite: "#fffff8",
    nearWhite: "#f3f3f3",
    lightGreenBg: "#e6f4ea"
  },
  typography: {
    primaryFont: "Libre Franklin",
    serifFont: "Palatino, Georgia, serif",
    monospaceFont: "IBM Plex Mono",
    baseSize: "15px",
    bodySize: "1.1rem"
  },
  spacing: {
    sidebarWidth: "223px",
    contentWidth: "66%",
    maxWidth: "1024px"
  },
  breakpoints: {
    mobile: "1024px"
  }
}
```

## Implementation Files

For implementing this design system in other frameworks:

1. **DESIGN_SYSTEM.md** - This document (complete design system reference)
2. **tailwind.config.js** - Tailwind CSS configuration matching this design system
3. **tailwind-base.css** - Base styles and component classes using Tailwind
4. **TAILWIND_SETUP.md** - Setup and usage guide for the Tailwind config

These files provide everything needed to recreate this design system in Django, React, or any other framework using Tailwind CSS.

