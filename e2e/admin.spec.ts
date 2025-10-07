import { test, expect } from '@playwright/test';

test.describe('Admin Interface', () => {
  test.beforeEach(async ({ page }) => {
    // Start the backend server for admin tests
    await page.goto('/admin/login');
  });

  test('admin login flow', async ({ page }) => {
    await expect(page.getByText('ClearSight CMS')).toBeVisible();
    
    // Fill login form
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    
    // Submit form
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/admin');
    await expect(page.getByText('Dashboard')).toBeVisible();
  });

  test('admin dashboard displays overview', async ({ page }) => {
    // Login first
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Check dashboard elements
    await expect(page.getByText('Welcome to ClearSight CMS')).toBeVisible();
    
    // Check stat cards
    await expect(page.getByText('Total Testimonials')).toBeVisible();
    await expect(page.getByText('Published Articles')).toBeVisible();
    await expect(page.getByText('Media Files')).toBeVisible();
    
    // Check recent activity
    await expect(page.getByText('Recent Activity')).toBeVisible();
  });

  test('sidebar navigation works', async ({ page }) => {
    // Login
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Test sidebar navigation
    await page.getByText('Testimonials').click();
    await expect(page).toHaveURL('/admin/testimonials');
    
    await page.getByText('Articles').click();
    await expect(page).toHaveURL('/admin/articles');
    
    await page.getByText('Media Library').click();
    await expect(page).toHaveURL('/admin/media');
  });

  test('logout functionality', async ({ page }) => {
    // Login
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Logout
    await page.getByRole('button', { name: /logout/i }).click();
    
    // Should redirect to login
    await expect(page).toHaveURL('/admin/login');
  });

  test('unauthorized access redirects to login', async ({ page }) => {
    await page.goto('/admin');
    
    // Should redirect to login page
    await expect(page).toHaveURL('/admin/login');
  });

  test('invalid login shows error', async ({ page }) => {
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Should show error message
    await expect(page.getByText(/Invalid credentials/)).toBeVisible();
  });

  test('mobile admin interface', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Login
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Mobile menu should be present
    await page.getByRole('button', { name: /menu/i }).click();
    
    // Sidebar should be visible
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Testimonials')).toBeVisible();
  });
});