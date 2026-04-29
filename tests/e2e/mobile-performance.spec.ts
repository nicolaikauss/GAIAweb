import { test, expect } from '@playwright/test';

test.describe('Mobile Performance', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
  });

  test('should meet mobile performance budget', async ({ page }) => {
    // Start performance measurement
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for performance issues
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        totalTime: navigation.loadEventEnd - navigation.fetchStart
      };
    });
    
    // Performance budget checks
    expect(performanceMetrics.domContentLoaded).toBeLessThan(2000); // 2s budget
    expect(performanceMetrics.loadComplete).toBeLessThan(3000); // 3s budget
    expect(performanceMetrics.totalTime).toBeLessThan(4000); // 4s budget
  });

  test('should have optimized images', async ({ page }) => {
    await page.goto('/inventory');
    
    // Check images have proper attributes
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      
      // Check image is responsive
      await expect(img).toHaveCSS('max-width', '100%');
      await expect(img).toHaveCSS('height', 'auto');
      
      // Check loading attribute
      const loading = await img.getAttribute('loading');
      expect(loading).toBe('lazy');
    }
  });

  test('should prevent layout shift', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for CLS indicators
    const cards = page.locator('.grid > div');
    await expect(cards.first()).toBeVisible();
    
    // Check cards have consistent sizing
    const firstCard = cards.first();
    const cardHeight = await firstCard.boundingBox();
    
    // Wait for any animations to complete
    await page.waitForTimeout(1000);
    
    const finalCardHeight = await firstCard.boundingBox();
    expect(finalCardHeight?.height).toBe(cardHeight?.height);
  });

  test('should have accessible touch targets', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check all interactive elements meet minimum size
    const interactiveElements = page.locator('button, a, input, select, textarea');
    const elementCount = await interactiveElements.count();
    
    for (let i = 0; i < elementCount; i++) {
      const element = interactiveElements.nth(i);
      const box = await element.boundingBox();
      
      if (box) {
        // WCAG AA minimum: 44x44px
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('should support reduced motion', async ({ page }) => {
    // Enable reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto('/');
    
    // Check that animations are disabled
    const animatedElements = page.locator('[style*="animation"], .animate-');
    const animatedCount = await animatedElements.count();
    
    // Most animations should be disabled or minimal
    expect(animatedCount).toBeLessThan(5);
  });

  test('should handle mobile gestures', async ({ page }) => {
    await page.goto('/inventory');
    
    // Test swipe gestures on artwork cards
    const firstCard = page.locator('.grid > div').first();
    
    if (await firstCard.isVisible()) {
      // Simulate touch events
      await firstCard.tap();
      
      // Check that touch feedback is provided
      await expect(firstCard).toHaveClass(/active:scale-95|hover:scale-105/);
    }
  });

  test('should optimize for mobile data usage', async ({ page }) => {
    // Monitor network requests
    const requests: string[] = [];
    
    page.on('request', request => {
      requests.push(request.url());
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for unnecessary large requests
    const largeRequests = requests.filter(url => 
      url.includes('.jpg') || url.includes('.png') || url.includes('.webp')
    );
    
    // Should have optimized image requests
    expect(largeRequests.length).toBeLessThan(10);
  });

  test('should maintain performance across page transitions', async ({ page }) => {
    const startTime = Date.now();
    
    // Navigate through multiple pages
    await page.goto('/');
    await page.goto('/auth');
    await page.goto('/dashboard');
    await page.goto('/inventory');
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // Should complete navigation quickly
    expect(totalTime).toBeLessThan(10000); // 10s budget for all transitions
  });
});
