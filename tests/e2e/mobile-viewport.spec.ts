import { test, expect } from '@playwright/test';

test.describe('Mobile Viewport Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
  });

  test('Dashboard loads without horizontal scroll on mobile', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check that there's no horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    
    // Check that main elements are visible
    await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="Ask AI"]')).toBeVisible();
    
    // Check that cards are properly stacked
    const cards = page.locator('[data-testid="dashboard-card"]');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);
    
    // Verify first card is visible and not overlapping
    const firstCard = cards.first();
    await expect(firstCard).toBeVisible();
    
    const cardBox = await firstCard.boundingBox();
    expect(cardBox?.width).toBeLessThanOrEqual(390);
  });

  test('Add Artwork form works on mobile', async ({ page }) => {
    await page.goto('/inventory/add');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check form elements are visible and accessible
    await expect(page.locator('input[placeholder*="Enter artwork title"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="Enter artist"]')).toBeVisible();
    
    // Test form interaction
    await page.fill('input[placeholder*="Enter artwork title"]', 'Test Artwork');
    await page.fill('input[placeholder*="Enter artist"]', 'Test Artist');
    
    // Verify values were entered correctly
    const titleValue = await page.inputValue('input[placeholder*="Enter artwork title"]');
    const artistValue = await page.inputValue('input[placeholder*="Enter artist"]');
    
    expect(titleValue).toBe('Test Artwork');
    expect(artistValue).toBe('Test Artist');
    
    // Check that save button is visible and accessible
    const saveButton = page.locator('button:has-text("Save")');
    await expect(saveButton).toBeVisible();
    
    // Verify button has proper tap target size
    const buttonBox = await saveButton.boundingBox();
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
  });

  test('Inventory page displays correctly on mobile', async ({ page }) => {
    await page.goto('/inventory');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check header elements
    await expect(page.locator('h1')).toBeVisible();
    
    // Check search input
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();
    
    // Test search functionality
    await searchInput.fill('test');
    
    // Check that no horizontal scroll occurs
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  test('Authentication page works on mobile', async ({ page }) => {
    await page.goto('/auth');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    
    // Test form interaction
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Verify values were entered correctly
    const emailValue = await page.inputValue('input[type="email"]');
    const passwordValue = await page.inputValue('input[type="password"]');
    
    expect(emailValue).toBe('test@example.com');
    expect(passwordValue).toBe('password123');
    
    // Check that sign in button is visible and has proper size
    const signInButton = page.locator('button[type="submit"]');
    await expect(signInButton).toBeVisible();
    
    const buttonBox = await signInButton.boundingBox();
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
  });

  test('Landing page displays correctly on mobile', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check main title
    await expect(page.locator('h1')).toBeVisible();
    
    // Check that buttons are properly stacked on mobile
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
    
    // Verify first button is visible and has proper size
    const firstButton = buttons.first();
    await expect(firstButton).toBeVisible();
    
    const buttonBox = await firstButton.boundingBox();
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
    
    // Check that no horizontal scroll occurs
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  test('Language toggle works on mobile', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find language toggle button
    const languageToggle = page.locator('button:has-text("EN | FR")');
    await expect(languageToggle).toBeVisible();
    
    // Click language toggle
    await languageToggle.click();
    
    // Wait for language change
    await page.waitForTimeout(500);
    
    // Check that page title changed
    const title = await page.title();
    expect(title).toContain('Tableau de Bord');
    
    // Verify button still has proper size
    const buttonBox = await languageToggle.boundingBox();
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
  });
});
