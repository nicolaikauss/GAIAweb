import { test, expect } from '@playwright/test';

test.describe('Mobile Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
  });

  test('should display mobile-optimized landing page', async ({ page }) => {
    await page.goto('/');
    
    // Check mobile viewport
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover');
    
    // Check responsive text sizing
    const title = page.locator('h1');
    await expect(title).toBeVisible();
    
    // Check mobile button layout
    const buttons = page.locator('button');
    await expect(buttons.first()).toHaveClass(/tap-target/);
    
    // Check language toggle is visible
    const languageToggle = page.locator('button[aria-label*="language"], button[aria-label*="Switch"]');
    await expect(languageToggle).toBeVisible();
  });

  test('should navigate through mobile auth flow', async ({ page }) => {
    await page.goto('/auth');
    
    // Check mobile form layout
    const form = page.locator('form');
    await expect(form).toBeVisible();
    
    // Check input fields have proper mobile attributes
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('type', 'email');
    
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Check submit button is touch-friendly
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toHaveClass(/tap-target/);
  });

  test('should display mobile-optimized dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check mobile header layout
    const header = page.locator('header, .flex.items-center.justify-between').first();
    await expect(header).toBeVisible();
    
    // Check cards are responsive
    const cards = page.locator('[data-testid="dashboard-card"], .grid > div');
    await expect(cards.first()).toBeVisible();
    
    // Check AI search bar is mobile-friendly
    const searchInput = page.locator('input[placeholder*="AI"]');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveClass(/tap-target/);
  });

  test('should handle mobile inventory page', async ({ page }) => {
    await page.goto('/inventory');
    
    // Check mobile search
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveClass(/tap-target/);
    
    // Check artwork grid is responsive
    const grid = page.locator('.grid');
    await expect(grid).toHaveClass(/grid-cols-1/);
    
    // Check add button is touch-friendly
    const addButton = page.locator('button:has-text("Add")');
    await expect(addButton).toBeVisible();
    await expect(addButton).toHaveClass(/tap-target/);
  });

  test('should support mobile form interactions', async ({ page }) => {
    await page.goto('/inventory/add');
    
    // Check form layout
    const form = page.locator('form');
    await expect(form).toBeVisible();
    
    // Check all inputs are touch-friendly
    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      await expect(input).toHaveClass(/tap-target/);
    }
    
    // Check save/cancel buttons
    const saveButton = page.locator('button:has-text("Save")');
    const cancelButton = page.locator('button:has-text("Cancel")');
    
    await expect(saveButton).toHaveClass(/tap-target/);
    await expect(cancelButton).toHaveClass(/tap-target/);
  });

  test('should prevent horizontal scroll', async ({ page }) => {
    await page.goto('/');
    
    // Check body has overflow-x: hidden
    const body = page.locator('body');
    await expect(body).toHaveCSS('overflow-x', 'hidden');
    
    // Check html has overflow-x: hidden
    const html = page.locator('html');
    await expect(html).toHaveCSS('overflow-x', 'hidden');
  });

  test('should respect safe area insets', async ({ page }) => {
    await page.goto('/');
    
    // Check for safe area classes
    const container = page.locator('.min-h-dvh').first();
    await expect(container).toHaveClass(/safe-top/);
    await expect(container).toHaveClass(/safe-bottom/);
  });

  test('should support language toggle on mobile', async ({ page }) => {
    await page.goto('/dashboard');
    
    const languageToggle = page.locator('button[aria-label*="language"], button[aria-label*="Switch"]');
    await expect(languageToggle).toBeVisible();
    
    // Click language toggle
    await languageToggle.click();
    
    // Wait for language change
    await page.waitForTimeout(500);
    
    // Check that text has changed (assuming French)
    const title = page.locator('h1[data-testid="dashboard-title"]');
    await expect(title).toContainText('Tableau de Bord');
  });
});
