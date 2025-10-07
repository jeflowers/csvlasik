import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays main hero section', async ({ page }) => {
    await expect(page.getByText('Revolutionary')).toBeVisible();
    await expect(page.getByText('Vision Care')).toBeVisible();
    
    // Check for CTA buttons
    await expect(page.getByText('SCHEDULE CONSULTATION')).toBeVisible();
    await expect(page.getByText('(844) 211-5462')).toBeVisible();
  });

  test('shows animated procedure counter', async ({ page }) => {
    // Wait for counter animation to complete
    await page.waitForTimeout(3000);
    
    await expect(page.getByText('30,000+')).toBeVisible();
    await expect(page.getByText('Lives Transformed')).toBeVisible();
  });

  test('displays statistics cards', async ({ page }) => {
    await expect(page.getByText('Pacific Islands')).toBeVisible();
    await expect(page.getByText('Success Rate')).toBeVisible();
    await expect(page.getByText('Years Experience')).toBeVisible();
  });

  test('hero image carousel functions', async ({ page }) => {
    // Check for carousel indicators
    const indicators = page.locator('[aria-label*="Go to image"]');
    await expect(indicators).toHaveCount(5);
    
    // Click second indicator
    await indicators.nth(1).click();
    
    // Should change active indicator
    await expect(indicators.nth(1)).toHaveClass(/w-8/);
  });

  test('phone number is clickable', async ({ page }) => {
    const phoneLink = page.getByRole('link', { name: /\(844\) 211-5462/ });
    await expect(phoneLink).toHaveAttribute('href', 'tel:+18442115462');
  });

  test('navigation to other pages works', async ({ page }) => {
    await page.getByText('THE PACIFIC STORY').click();
    await expect(page).toHaveURL('/pacific-story');
    
    await page.goBack();
    
    await page.getByText('SCHEDULE CONSULTATION').first().click();
    await expect(page).toHaveURL('/contact');
  });

  test('responsive design on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Hero section should stack vertically
    await expect(page.getByText('Revolutionary')).toBeVisible();
    await expect(page.getByText('SCHEDULE CONSULTATION')).toBeVisible();
    
    // Statistics should be responsive
    await expect(page.getByText('Lives Transformed')).toBeVisible();
  });
});