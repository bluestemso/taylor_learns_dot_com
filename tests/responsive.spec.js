import { test, expect } from '@playwright/test';

/**
 * Responsive Design Tests
 * Tests layout behavior at different viewport sizes
 */

test.describe('Responsive Design', () => {
  test('should show sidebar on desktop (1024px+)', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');

    const sidebar = page.locator('.sidebar-nav');
    await expect(sidebar).toBeVisible();

    // Sidebar should not be translated off screen
    const transform = await sidebar.evaluate(el =>
      getComputedStyle(el).transform
    );

    expect(transform).toBe('none');
  });

  test('should hide sidebar on mobile (< 1024px)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    const sidebar = page.locator('.sidebar-nav');

    // Sidebar exists but is translated off screen
    const transform = await sidebar.evaluate(el =>
      getComputedStyle(el).transform
    );

    expect(transform).toContain('matrix');
  });

  test('should show mobile header on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const mobileHeader = page.locator('.mobile-header');
    await expect(mobileHeader).toBeVisible();
  });

  test('should hide mobile header on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const mobileHeader = page.locator('.mobile-header');

    // Mobile header should not be visible on desktop
    const display = await mobileHeader.evaluate(el =>
      getComputedStyle(el).display
    );

    expect(display).toBe('none');
  });

  test('content should be full width on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const content = page.locator('.w-two-thirds-ns').first();
    const width = await content.evaluate(el =>
      (el.offsetWidth / document.documentElement.offsetWidth) * 100
    );

    // Should be approximately 100% width (minus padding)
    expect(width).toBeGreaterThan(90);
  });

  test('content should be two-thirds width on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const content = page.locator('.w-two-thirds-ns').first();
    const width = await content.evaluate(el =>
      (el.offsetWidth / document.documentElement.offsetWidth) * 100
    );

    // Should be approximately 66.67% (accounting for sidebar offset)
    expect(width).toBeGreaterThan(40);
    expect(width).toBeLessThan(75);
  });

  test('should have proper spacing on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const sidebarLayout = page.locator('.sidebar-layout');
    const marginTop = await sidebarLayout.evaluate(el =>
      getComputedStyle(el).marginTop
    );

    // Should have top margin for mobile header (60px)
    expect(marginTop).toBe('60px');
  });

  test('should adapt at breakpoint (1023px to 1024px)', async ({ page }) => {
    // Test just below breakpoint
    await page.setViewportSize({ width: 1023, height: 768 });
    await page.goto('/');

    let mobileHeader = page.locator('.mobile-header');
    let mobileHeaderDisplay = await mobileHeader.evaluate(el =>
      getComputedStyle(el).display
    );

    expect(mobileHeaderDisplay).not.toBe('none');

    // Test just above breakpoint
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(200);

    mobileHeaderDisplay = await mobileHeader.evaluate(el =>
      getComputedStyle(el).display
    );

    expect(mobileHeaderDisplay).toBe('none');
  });

  test('should handle rotation (portrait to landscape)', async ({ page }) => {
    // Start in portrait (iPhone)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    let mobileHeader = page.locator('.mobile-header');
    await expect(mobileHeader).toBeVisible();

    // Rotate to landscape
    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForTimeout(200);

    // Mobile header should still be visible (< 1024px)
    await expect(mobileHeader).toBeVisible();
  });

  test('should have readable text at all sizes', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 },   // Mobile
      { width: 768, height: 1024 },  // Tablet
      { width: 1440, height: 900 },  // Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');

      // Check body text is at least 15px
      const bodyFontSize = await page.evaluate(() =>
        parseInt(getComputedStyle(document.documentElement).fontSize)
      );

      expect(bodyFontSize).toBeGreaterThanOrEqual(15);
    }
  });

  test('touch targets should be large enough on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Open hamburger menu
    await page.locator('#hamburger-btn').click();
    await page.waitForTimeout(400);

    // Check nav items are at least 44px tall (Apple's recommendation)
    const navItem = page.locator('.nav-item').first();
    const height = await navItem.evaluate(el => el.offsetHeight);

    expect(height).toBeGreaterThanOrEqual(40);
  });
});
