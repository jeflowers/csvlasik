import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('homepage loads within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    // Wait for main content to be visible
    await expect(page.getByText('Revolutionary')).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('images load with proper optimization', async ({ page }) => {
    await page.goto('/');
    
    // Check that images have proper attributes
    const heroImages = page.locator('img[alt*="Dr. Charles Flowers"]');
    
    for (const img of await heroImages.all()) {
      // Should have loading attribute
      const loading = await img.getAttribute('loading');
      expect(['lazy', 'eager']).toContain(loading);
      
      // Should have alt text
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
      expect(alt!.length).toBeGreaterThan(10);
    }
  });

  test('Core Web Vitals are within acceptable ranges', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Measure Largest Contentful Paint (LCP)
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        
        // Fallback timeout
        setTimeout(() => resolve(0), 5000);
      });
    });
    
    // LCP should be under 2.5 seconds
    expect(lcp).toBeLessThan(2500);
  });

  test('page is accessible', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    
    // Check for alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      
      // All images should have alt text (empty alt is acceptable for decorative images)
      expect(alt).not.toBeNull();
    }
    
    // Check for proper link text
    const links = page.locator('a');
    const linkCount = await links.count();
    
    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      
      // Links should have descriptive text or aria-label
      expect(text || ariaLabel).toBeTruthy();
    }
  });

  test('mobile performance is acceptable', async ({ page }) => {
    // Simulate mobile device
    await page.setViewportSize({ width: 375, height: 667 });
    
    const startTime = Date.now();
    await page.goto('/');
    
    await expect(page.getByText('Revolutionary')).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    
    // Mobile should load within 4 seconds (allowing for slower connections)
    expect(loadTime).toBeLessThan(4000);
  });

  test('translation switching performance', async ({ page }) => {
    await page.goto('/');
    
    // Measure time to switch languages
    const startTime = Date.now();
    
    await page.getByLabelText(/selectLanguage/i).click();
    await page.getByText('Español').click();
    
    // Wait for translation to complete
    await expect(page.getByText('Inicio')).toBeVisible();
    
    const switchTime = Date.now() - startTime;
    
    // Language switching should be fast (under 2 seconds)
    expect(switchTime).toBeLessThan(2000);
  });
});