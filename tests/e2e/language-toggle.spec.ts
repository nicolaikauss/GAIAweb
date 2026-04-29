import { test, expect } from '@playwright/test';

test.describe('Language Toggle', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Wait for the page to load
    await page.waitForSelector('[data-testid="dashboard-title"]', { timeout: 10000 });
  });

  test('should toggle between English and French', async ({ page }) => {
    // Check initial language is English
    await expect(page.locator('h1')).toContainText('Gaia Capital Dashboard');
    
    // Find and click the language toggle button
    const languageToggle = page.locator('button[aria-label*="language"], button[aria-label*="Switch"]');
    await expect(languageToggle).toBeVisible();
    
    // Click the toggle
    await languageToggle.click();
    
    // Wait for language change
    await page.waitForTimeout(500);
    
    // Check that the language has changed to French
    await expect(page.locator('h1')).toContainText('Tableau de Bord Gaia Capital');
    
    // Check that document language attribute is updated
    const htmlLang = await page.evaluate(() => document.documentElement.lang);
    expect(htmlLang).toBe('fr');
    
    // Check that document title is updated
    const title = await page.title();
    expect(title).toContain('Tableau de Bord Gaia Capital');
  });

  test('should persist language preference', async ({ page }) => {
    // Change to French
    const languageToggle = page.locator('button[aria-label*="language"], button[aria-label*="Switch"]');
    await languageToggle.click();
    await page.waitForTimeout(500);
    
    // Verify French is active
    await expect(page.locator('h1')).toContainText('Tableau de Bord Gaia Capital');
    
    // Reload the page
    await page.reload();
    await page.waitForSelector('[data-testid="dashboard-title"]', { timeout: 10000 });
    
    // Check that French is still active
    await expect(page.locator('h1')).toContainText('Tableau de Bord Gaia Capital');
    
    // Check localStorage for language preference
    const storedLang = await page.evaluate(() => localStorage.getItem('i18nextLng'));
    expect(storedLang).toBe('fr');
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    const languageToggle = page.locator('button[aria-label*="language"], button[aria-label*="Switch"]');
    
    // Check that the button is focusable
    await languageToggle.focus();
    await expect(languageToggle).toBeFocused();
    
    // Check aria-label is present
    const ariaLabel = await languageToggle.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
    expect(ariaLabel).toMatch(/language|Switch/);
    
    // Check tooltip appears on hover
    await languageToggle.hover();
    await expect(page.locator('[role="tooltip"]')).toBeVisible();
  });

  test('should update all dashboard text when language changes', async ({ page }) => {
    // Check English text
    await expect(page.locator('h1')).toContainText('Gaia Capital Dashboard');
    await expect(page.locator('text=Inventory')).toBeVisible();
    await expect(page.locator('text=Transactions')).toBeVisible();
    
    // Change to French
    const languageToggle = page.locator('button[aria-label*="language"], button[aria-label*="Switch"]');
    await languageToggle.click();
    await page.waitForTimeout(500);
    
    // Check French text
    await expect(page.locator('h1')).toContainText('Tableau de Bord Gaia Capital');
    await expect(page.locator('text=Inventaire')).toBeVisible();
    await expect(page.locator('text=Transactions')).toBeVisible();
  });
});
