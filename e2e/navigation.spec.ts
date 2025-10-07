import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('header navigation works correctly', async ({ page }) => {
    // Test main navigation links
    await page.getByText('About', { exact: true }).click();
    await expect(page).toHaveURL('/about');
    
    await page.getByText('Procedures').click();
    await expect(page).toHaveURL('/procedures');
    
    await page.getByText('Contact').click();
    await expect(page).toHaveURL('/contact');
  });

  test('procedures dropdown navigation', async ({ page }) => {
    // Hover over procedures to open dropdown
    await page.getByText('Procedures').hover();
    
    // Wait for dropdown to appear
    await expect(page.getByText('LASIK Surgery')).toBeVisible();
    await expect(page.getByText('PRK Surgery')).toBeVisible();
    await expect(page.getByText('ICL')).toBeVisible();
    
    // Click on LASIK
    await page.getByText('LASIK Surgery').click();
    await expect(page).toHaveURL('/procedures/lasik');
  });

  test('mobile menu functionality', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Open mobile menu
    await page.getByRole('button', { name: /menu/i }).click();
    
    // Check mobile menu items
    await expect(page.getByText('Home')).toBeVisible();
    await expect(page.getByText('About')).toBeVisible();
    await expect(page.getByText('Procedures')).toBeVisible();
    
    // Navigate via mobile menu
    await page.getByText('About').click();
    await expect(page).toHaveURL('/about');
  });

  test('language selector functionality', async ({ page }) => {
    // Open language selector
    await page.getByLabelText(/selectLanguage/i).click();
    
    // Check for language options
    await expect(page.getByText('Español')).toBeVisible();
    await expect(page.getByText('한국어')).toBeVisible();
    await expect(page.getByText('العربية')).toBeVisible();
    
    // Select Spanish
    await page.getByText('Español').click();
    
    // Check that language changed (URL or content should reflect change)
    await page.waitForTimeout(1000);
    
    // Language selector should show Spanish flag
    await expect(page.getByText('🇪🇸')).toBeVisible();
  });

  test('footer navigation links', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Test footer links
    await page.getByText('About Dr. Flowers').click();
    await expect(page).toHaveURL('/about');
    
    await page.goBack();
    
    await page.getByText('LASIK Surgery').click();
    await expect(page).toHaveURL('/procedures/lasik');
  });

  test('social media links are present', async ({ page }) => {
    // Check for social media icons in header
    const socialLinks = page.locator('header a[href="#"]');
    await expect(socialLinks).toHaveCount(5); // Facebook, Instagram, YouTube, Twitter, TikTok
  });

  test('contact information is accessible', async ({ page }) => {
    // Check phone number in header
    await expect(page.getByText('(844) 211-5462')).toBeVisible();
    
    // Check email in footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.getByText('info@clearsightlasik.com')).toBeVisible();
  });
});