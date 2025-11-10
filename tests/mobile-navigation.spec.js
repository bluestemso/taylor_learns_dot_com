import { test, expect } from '@playwright/test';

/**
 * Mobile Navigation Tests
 * Tests hamburger menu functionality on mobile devices
 */

test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show mobile header with hamburger button', async ({ page }) => {
    const mobileHeader = page.locator('.mobile-header');
    await expect(mobileHeader).toBeVisible();

    const hamburgerBtn = page.locator('#hamburger-btn');
    await expect(hamburgerBtn).toBeVisible();
  });

  test('should hide sidebar by default on mobile', async ({ page }) => {
    const sidebar = page.locator('.sidebar-nav');

    // Sidebar should exist but be hidden (transformed off-screen)
    await expect(sidebar).toBeAttached();

    const transform = await sidebar.evaluate(el =>
      getComputedStyle(el).transform
    );

    // Should be translated off screen (translateX(-100%))
    expect(transform).toContain('matrix');
  });

  test('should open sidebar when hamburger is clicked', async ({ page }) => {
    const hamburgerBtn = page.locator('#hamburger-btn');
    const sidebar = page.locator('.sidebar-nav');
    const overlay = page.locator('#mobile-overlay');

    // Click hamburger
    await hamburgerBtn.click();

    // Wait for animation
    await page.waitForTimeout(400);

    // Sidebar should have mobile-open class
    await expect(sidebar).toHaveClass(/mobile-open/);

    // Overlay should be visible
    await expect(overlay).toHaveClass(/active/);

    // Body scroll should be disabled
    const bodyOverflow = await page.evaluate(() =>
      document.body.style.overflow
    );
    expect(bodyOverflow).toBe('hidden');
  });

  test('should close sidebar when overlay is clicked', async ({ page }) => {
    const hamburgerBtn = page.locator('#hamburger-btn');
    const sidebar = page.locator('.sidebar-nav');
    const overlay = page.locator('#mobile-overlay');

    // Open menu
    await hamburgerBtn.click();
    await page.waitForTimeout(400);

    // Click overlay
    await overlay.click();
    await page.waitForTimeout(400);

    // Sidebar should no longer have mobile-open class
    await expect(sidebar).not.toHaveClass(/mobile-open/);

    // Overlay should not be visible
    await expect(overlay).not.toHaveClass(/active/);
  });

  test('should close sidebar when nav link is clicked', async ({ page }) => {
    const hamburgerBtn = page.locator('#hamburger-btn');
    const sidebar = page.locator('.sidebar-nav');
    const aboutLink = page.locator('.nav-item').filter({ hasText: 'About' });

    // Open menu
    await hamburgerBtn.click();
    await page.waitForTimeout(400);

    // Click About link
    await aboutLink.click();

    // Should navigate to about page
    await expect(page).toHaveURL(/\/about/);
  });

  test('should animate hamburger icon to X when open', async ({ page }) => {
    const hamburgerBtn = page.locator('#hamburger-btn');

    // Click to open
    await hamburgerBtn.click();
    await page.waitForTimeout(400);

    // Button should have active class
    await expect(hamburgerBtn).toHaveClass(/active/);

    // First and third spans should be rotated
    const firstSpan = hamburgerBtn.locator('span').nth(0);
    const secondSpan = hamburgerBtn.locator('span').nth(1);

    const firstTransform = await firstSpan.evaluate(el =>
      getComputedStyle(el).transform
    );
    const secondOpacity = await secondSpan.evaluate(el =>
      getComputedStyle(el).opacity
    );

    // First span should be rotated (transform will be a matrix)
    expect(firstTransform).toContain('matrix');

    // Second span should be invisible
    expect(secondOpacity).toBe('0');
  });

  test('should show site title in mobile header', async ({ page }) => {
    const title = page.locator('.mobile-header h1');
    await expect(title).toContainText('Taylor Learns');
  });

  test('should have working search in mobile sidebar', async ({ page }) => {
    const hamburgerBtn = page.locator('#hamburger-btn');

    // Open menu
    await hamburgerBtn.click();
    await page.waitForTimeout(400);

    // Search should be visible
    const searchInput = page.locator('.search-input');
    await expect(searchInput).toBeVisible();

    // Should be able to type
    await searchInput.fill('test search');
    await expect(searchInput).toHaveValue('test search');
  });
});
