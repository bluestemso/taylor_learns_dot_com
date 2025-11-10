# Playwright Tests for Taylor Learns Blog

This directory contains end-to-end tests for the blog's design system, navigation, search functionality, and responsive design.

## Installation

The tests are already set up! If you need to reinstall Playwright browsers:

```bash
npx playwright install
```

## Running Tests

### All Tests (Headless)
```bash
npm test
```

### Watch Tests in UI Mode (Interactive)
```bash
npm run test:ui
```

### Run Tests with Browser Visible
```bash
npm run test:headed
```

### Debug Mode (Step Through Tests)
```bash
npm run test:debug
```

### Run Specific Test Suites
```bash
npm run test:design      # Design system tests
npm run test:nav         # Mobile navigation tests
npm run test:search      # Search functionality tests
npm run test:responsive  # Responsive design tests
```

### Test on Mobile Only
```bash
npm run test:mobile
```

### View Test Report
```bash
npm run test:report
```

## Test Files

### `design-system.spec.js`
Tests core design system elements:
- ✅ Blue color theme (#0066cc primary)
- ✅ Libre Franklin typography
- ✅ Sidebar navigation (223px width, fixed position)
- ✅ Link hover effects with blue shadow
- ✅ Search bar in sidebar

### `mobile-navigation.spec.js`
Tests mobile hamburger menu functionality:
- ✅ Hamburger button visibility on mobile
- ✅ Sidebar slide-in animation
- ✅ Overlay click to close
- ✅ Nav link click closes menu
- ✅ Hamburger icon animates to X
- ✅ Body scroll prevention when menu open
- ✅ Search bar accessible in mobile menu

### `search.spec.js`
Tests search bar UI and functionality:
- ✅ Search bar with magnifying glass icon (🔍)
- ✅ Single-line layout (no wrapping)
- ✅ Submit button disabled when empty
- ✅ Submit button enabled when text entered
- ✅ Blue border on focus
- ✅ Form submission with query parameter
- ✅ Responsive search (mobile and desktop)

### `responsive.spec.js`
Tests responsive design at different viewports:
- ✅ Sidebar visible on desktop (≥1024px)
- ✅ Sidebar hidden on mobile (<1024px)
- ✅ Mobile header on small screens
- ✅ Content full-width on mobile
- ✅ Content two-thirds width on desktop
- ✅ Breakpoint transitions (1023px → 1024px)
- ✅ Portrait/landscape rotation handling
- ✅ Touch target sizes (≥44px)

## Configuration

Tests are configured in `playwright.config.js` with:

- **Base URL**: `http://127.0.0.1:8000` (Django dev server)
- **Browsers**: Chromium, Firefox, WebKit
- **Mobile**: Pixel 5, iPhone 12
- **Auto-start**: Django dev server starts automatically
- **Timeout**: 30 seconds per test
- **Retry**: 2 retries in CI mode
- **Reporting**: HTML report + list output

## Development Workflow

### Making Changes to Tests

1. Edit test files in `tests/` directory
2. Run tests: `npm test`
3. View report: `npm run test:report`

### Adding New Tests

Create a new `.spec.js` file in `tests/`:

```javascript
import { test, expect } from '@playwright/test';

test.describe('My Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Your test code
  });
});
```

Then add a script in `package.json`:

```json
"test:myfeature": "playwright test tests/my-feature.spec.js"
```

## Continuous Integration

Tests are configured to work in CI with:
- Retry: 2 attempts
- Workers: 1 (serial execution)
- No server reuse

Example GitHub Actions:

```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright Browsers
  run: npx playwright install --with-deps

- name: Run tests
  run: npm test
```

## Troubleshooting

### Tests fail to connect to server
- Make sure Django dev server is running: `python manage.py runserver`
- Check `baseURL` in `playwright.config.js` matches your server

### Browsers not installed
```bash
npx playwright install
```

### View detailed trace for failed test
```bash
npm run test:debug
```

### Tests fail on specific viewport
```bash
npm run test:mobile    # Test mobile-specific issues
```

### Update browser versions
```bash
npx playwright install --force
```

## Test Coverage

Current test coverage:

- ✅ Design system (8 tests)
- ✅ Mobile navigation (8 tests)
- ✅ Search functionality (10 tests)
- ✅ Responsive design (11 tests)

**Total: 37 tests** across 5 browsers/devices = **185 test runs**

## Best Practices

1. **Use descriptive test names**: Clearly state what is being tested
2. **Test user interactions**: Click, type, hover, etc.
3. **Check visual state**: Colors, sizes, visibility
4. **Test across viewports**: Mobile, tablet, desktop
5. **Assert meaningfully**: Check specific values, not just existence
6. **Keep tests independent**: Each test should work alone
7. **Use page objects**: For complex pages, extract selectors

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Tests](https://playwright.dev/docs/debug)
- [CI/CD Setup](https://playwright.dev/docs/ci)

---

*Tests created: November 7, 2025*
