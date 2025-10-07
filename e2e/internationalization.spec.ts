import { test, expect } from '@playwright/test';

test.describe('Internationalization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('language selector changes site language', async ({ page }) => {
    // Open language selector
    await page.getByLabelText(/selectLanguage/i).click();
    
    // Select Spanish
    await page.getByText('Español').click();
    
    // Wait for language change
    await page.waitForTimeout(1000);
    
    // Check that content changed to Spanish
    await expect(page.getByText('Inicio')).toBeVisible(); // "Home" in Spanish
    
    // Check that language selector shows Spanish
    await expect(page.getByText('🇪🇸')).toBeVisible();
  });

  test('RTL languages display correctly', async ({ page }) => {
    // Select Arabic
    await page.getByLabelText(/selectLanguage/i).click();
    await page.getByText('العربية').click();
    
    await page.waitForTimeout(1000);
    
    // Check RTL direction
    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', 'rtl');
    
    // Check RTL class on body
    const body = page.locator('body');
    await expect(body).toHaveClass(/rtl/);
  });

  test('language persistence across page navigation', async ({ page }) => {
    // Change to Spanish
    await page.getByLabelText(/selectLanguage/i).click();
    await page.getByText('Español').click();
    await page.waitForTimeout(1000);
    
    // Navigate to another page
    await page.getByText('Acerca de').click(); // "About" in Spanish
    await expect(page).toHaveURL('/about');
    
    // Language should persist
    await expect(page.getByText('🇪🇸')).toBeVisible();
  });

  test('medical terms remain untranslated', async ({ page }) => {
    // Change to Spanish
    await page.getByLabelText(/selectLanguage/i).click();
    await page.getByText('Español').click();
    await page.waitForTimeout(1000);
    
    // Navigate to procedures page
    await page.getByText('Procedimientos').click();
    
    // Medical terms should remain in English
    await expect(page.getByText('LASIK')).toBeVisible();
    await expect(page.getByText('PRK')).toBeVisible();
    await expect(page.getByText('ICL')).toBeVisible();
    await expect(page.getByText('Dr. Charles Flowers')).toBeVisible();
  });

  test('phone number formats correctly for different languages', async ({ page }) => {
    // Check US format (default)
    await expect(page.getByText('(844) 211-5462')).toBeVisible();
    
    // Change to Korean
    await page.getByLabelText(/selectLanguage/i).click();
    await page.getByText('한국어').click();
    await page.waitForTimeout(1000);
    
    // Phone number should still be visible and clickable
    await expect(page.getByRole('link', { name: /211-5462/ })).toBeVisible();
  });

  test('translation status indicator works', async ({ page }) => {
    // Change to non-English language
    await page.getByLabelText(/selectLanguage/i).click();
    await page.getByText('Español').click();
    await page.waitForTimeout(1000);
    
    // Translation status should appear
    await expect(page.locator('.translation-status')).toBeVisible();
  });

  test('fallback to English for missing translations', async ({ page }) => {
    // This test would check that missing translations fall back to English
    // In a real scenario, you might temporarily remove a translation file
    
    await page.getByLabelText(/selectLanguage/i).click();
    await page.getByText('한국어').click();
    await page.waitForTimeout(1000);
    
    // Even if some translations are missing, page should still function
    await expect(page.getByText('ClearSight')).toBeVisible();
  });
});