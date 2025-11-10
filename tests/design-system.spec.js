import { test, expect } from '@playwright/test';

/**
 * Design System Tests
 * Validates color palette, typography, and core design tokens
 */

test.describe('Design System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should use blue primary color theme', async ({ page }) => {
    // Check CSS variables are set correctly
    const rootStyles = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      return {
        primaryBlue: root.getPropertyValue('--color-primary-blue').trim(),
        brightBlue: root.getPropertyValue('--color-bright-blue').trim(),
      };
    });

    expect(rootStyles.primaryBlue).toBe('#0066cc');
    expect(rootStyles.brightBlue).toBe('#00a0ff');
  });

  test('should use Libre Franklin font', async ({ page }) => {
    const h1 = page.locator('h1').first();
    const fontFamily = await h1.evaluate(el =>
      getComputedStyle(el).fontFamily
    );

    expect(fontFamily).toContain('Libre Franklin');
  });

  test('should have sidebar navigation on desktop', async ({ page, viewport }) => {
    // Skip if mobile viewport
    if (viewport && viewport.width < 1024) {
      test.skip();
    }

    const sidebar = page.locator('.sidebar-nav');
    await expect(sidebar).toBeVisible();

    // Verify sidebar is fixed position
    const position = await sidebar.evaluate(el =>
      getComputedStyle(el).position
    );
    expect(position).toBe('fixed');
  });

  test('should have correct sidebar width', async ({ page, viewport }) => {
    if (viewport && viewport.width < 1024) {
      test.skip();
    }

    const sidebar = page.locator('.sidebar-nav');
    const width = await sidebar.evaluate(el =>
      getComputedStyle(el).width
    );

    expect(width).toBe('223px');
  });

  test('should display navigation links', async ({ page }) => {
    await expect(page.locator('text=Home')).toBeVisible();
    await expect(page.locator('text=About')).toBeVisible();
    await expect(page.locator('text=Tags')).toBeVisible();
    await expect(page.locator('text=Feed')).toBeVisible();
  });

  test('should have search bar in sidebar', async ({ page, viewport }) => {
    if (viewport && viewport.width < 1024) {
      test.skip();
    }

    const searchInput = page.locator('.search-input');
    await expect(searchInput).toBeVisible();
  });

  test('should apply blue link hover effects', async ({ page }) => {
    const link = page.locator('a').first();

    // Hover over link
    await link.hover();

    // Check for box-shadow (blue highlight)
    const boxShadow = await link.evaluate(el =>
      getComputedStyle(el).boxShadow
    );

    expect(boxShadow).not.toBe('none');
  });
});
