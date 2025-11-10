import { test, expect } from '@playwright/test';

/**
 * Search Functionality Tests
 * Tests search bar UI and functionality
 */

test.describe('Search Bar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display search bar with icon', async ({ page, viewport }) => {
    let searchInput;

    if (viewport && viewport.width < 1024) {
      // On mobile, need to open hamburger menu first
      await page.locator('#hamburger-btn').click();
      await page.waitForTimeout(400);
    }

    searchInput = page.locator('.search-input');
    await expect(searchInput).toBeVisible();

    // Check for search button with magnifying glass
    const searchButton = page.locator('.search-submit');
    await expect(searchButton).toBeVisible();

    // Button should have emoji icon (🔍)
    const buttonContent = await searchButton.evaluate(el =>
      window.getComputedStyle(el, ':before').content
    );
    expect(buttonContent).toContain('🔍');
  });

  test('should have proper placeholder text', async ({ page, viewport }) => {
    if (viewport && viewport.width < 1024) {
      await page.locator('#hamburger-btn').click();
      await page.waitForTimeout(400);
    }

    const searchInput = page.locator('.search-input');
    const placeholder = await searchInput.getAttribute('placeholder');

    expect(placeholder).toBeTruthy();
  });

  test('search button should be disabled when input is empty', async ({ page, viewport }) => {
    if (viewport && viewport.width < 1024) {
      await page.locator('#hamburger-btn').click();
      await page.waitForTimeout(400);
    }

    const searchButton = page.locator('.search-submit');

    // Button should be disabled initially
    await expect(searchButton).toBeDisabled();
  });

  test('search button should enable when text is entered', async ({ page, viewport }) => {
    if (viewport && viewport.width < 1024) {
      await page.locator('#hamburger-btn').click();
      await page.waitForTimeout(400);
    }

    const searchInput = page.locator('.search-input');
    const searchButton = page.locator('.search-submit');

    // Type some text
    await searchInput.fill('test query');

    // Button should now be enabled
    await expect(searchButton).toBeEnabled();
  });

  test('search form should not wrap to multiple lines', async ({ page, viewport }) => {
    if (viewport && viewport.width < 1024) {
      await page.locator('#hamburger-btn').click();
      await page.waitForTimeout(400);
    }

    const searchForm = page.locator('.search-form');

    // Get the height of the form
    const formHeight = await searchForm.evaluate(el => el.offsetHeight);

    // Should be a single line (approximately 40-50px tall)
    expect(formHeight).toBeLessThan(60);
    expect(formHeight).toBeGreaterThan(30);
  });

  test('search input should expand to fill available space', async ({ page, viewport }) => {
    if (viewport && viewport.width < 1024) {
      await page.locator('#hamburger-btn').click();
      await page.waitForTimeout(400);
    }

    const searchInput = page.locator('.search-input');
    const inputWidth = await searchInput.evaluate(el => el.offsetWidth);

    // Input should take up most of the space (more than 100px)
    expect(inputWidth).toBeGreaterThan(100);
  });

  test('search button should have fixed width', async ({ page, viewport }) => {
    if (viewport && viewport.width < 1024) {
      await page.locator('#hamburger-btn').click();
      await page.waitForTimeout(400);
    }

    const searchButton = page.locator('.search-submit');
    const buttonWidth = await searchButton.evaluate(el => el.offsetWidth);

    // Button should be around 40px wide
    expect(buttonWidth).toBeGreaterThanOrEqual(40);
    expect(buttonWidth).toBeLessThanOrEqual(50);
  });

  test('should focus border color change on input focus', async ({ page, viewport }) => {
    if (viewport && viewport.width < 1024) {
      await page.locator('#hamburger-btn').click();
      await page.waitForTimeout(400);
    }

    const searchForm = page.locator('.search-form');
    const searchInput = page.locator('.search-input');

    // Get initial border color
    const initialBorder = await searchForm.evaluate(el =>
      getComputedStyle(el).borderColor
    );

    // Focus input
    await searchInput.focus();

    // Get focused border color
    const focusedBorder = await searchForm.evaluate(el =>
      getComputedStyle(el).borderColor
    );

    // Border color should change (to blue)
    expect(focusedBorder).not.toBe(initialBorder);
  });

  test('should submit search form with query', async ({ page, viewport }) => {
    if (viewport && viewport.width < 1024) {
      await page.locator('#hamburger-btn').click();
      await page.waitForTimeout(400);
    }

    const searchInput = page.locator('.search-input');
    const searchButton = page.locator('.search-submit');

    // Enter search query
    await searchInput.fill('playwright test');

    // Submit form
    await searchButton.click();

    // Should navigate to search page (or stay on same page with query param)
    await page.waitForTimeout(500);

    const url = page.url();
    expect(url).toContain('q=playwright');
  });
});
