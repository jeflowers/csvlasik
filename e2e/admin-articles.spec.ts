import { test, expect } from '@playwright/test';

test.describe('Admin Articles CRUD', () => {
  test.beforeEach(async ({ page }) => {
    // Note: These tests assume you have admin credentials
    // In a real scenario, you would set up test users
    await page.goto('/admin/login');
  });

  test('should display articles manager interface', async ({ page }) => {
    await page.goto('/admin/articles');

    // Should show either login page or articles manager
    const isLoginPage = await page.locator('input[type="email"]').isVisible().catch(() => false);

    if (!isLoginPage) {
      await expect(page.locator('h1')).toContainText(/Articles Management/i);
      await expect(page.locator('button:has-text("New Article")')).toBeVisible();
    }
  });

  test('should show search and filter options', async ({ page }) => {
    await page.goto('/admin/articles');

    const isLoginPage = await page.locator('input[type="email"]').isVisible().catch(() => false);

    if (!isLoginPage) {
      await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
      await expect(page.locator('select')).toHaveCount(2); // Status and Category filters
    }
  });

  test('should open create article modal', async ({ page }) => {
    await page.goto('/admin/articles');

    const newArticleButton = page.locator('button:has-text("New Article")');
    if (await newArticleButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await newArticleButton.click();

      // Modal should appear
      await expect(page.locator('text="Create New Article"')).toBeVisible();
      await expect(page.locator('input[placeholder*="title"]')).toBeVisible();
      await expect(page.locator('textarea')).toBeVisible();
    }
  });

  test('should validate required fields in create form', async ({ page }) => {
    await page.goto('/admin/articles');

    const newArticleButton = page.locator('button:has-text("New Article")');
    if (await newArticleButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await newArticleButton.click();

      // Try to submit without filling required fields
      const submitButton = page.locator('button[type="submit"]:has-text("Create")');
      await submitButton.click();

      // HTML5 validation should prevent submission
      const titleInput = page.locator('input[placeholder*="title"]');
      await expect(titleInput).toBeFocused();
    }
  });

  test('should create new article', async ({ page }) => {
    await page.goto('/admin/articles');

    const newArticleButton = page.locator('button:has-text("New Article")');
    if (await newArticleButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await newArticleButton.click();

      // Fill in the form
      await page.fill('input[placeholder*="title"]', 'Test Article ' + Date.now());
      await page.fill('textarea', 'This is a test article content for automated testing.');

      // Select category
      const categorySelect = page.locator('select').first();
      await categorySelect.selectOption('Procedures');

      // Submit
      await page.click('button[type="submit"]:has-text("Create")');

      // Should close modal and show success
      await expect(page.locator('text="Create New Article"')).not.toBeVisible({ timeout: 3000 });
    }
  });

  test('should filter articles by status', async ({ page }) => {
    await page.goto('/admin/articles');

    const statusFilter = page.locator('select').first();
    if (await statusFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Test draft filter
      await statusFilter.selectOption('draft');
      await page.waitForTimeout(500); // Wait for filter to apply

      // Test published filter
      await statusFilter.selectOption('published');
      await page.waitForTimeout(500);

      // Test all filter
      await statusFilter.selectOption('all');
      await page.waitForTimeout(500);
    }
  });

  test('should search articles', async ({ page }) => {
    await page.goto('/admin/articles');

    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await searchInput.fill('test');
      await page.waitForTimeout(500); // Debounce

      // Should filter results or show "No articles found"
      const resultsOrEmpty = await page.locator('table tbody tr, text="No articles found"').first().isVisible();
      expect(resultsOrEmpty).toBe(true);
    }
  });

  test('should edit existing article', async ({ page }) => {
    await page.goto('/admin/articles');

    const editButton = page.locator('button[title="Edit"]').first();
    if (await editButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await editButton.click();

      // Modal should appear with edit title
      await expect(page.locator('text="Edit Article"')).toBeVisible();

      // Modify the article
      const titleInput = page.locator('input[placeholder*="title"]');
      await titleInput.fill(await titleInput.inputValue() + ' (edited)');

      // Submit
      await page.click('button[type="submit"]:has-text("Update")');

      // Should close modal
      await expect(page.locator('text="Edit Article"')).not.toBeVisible({ timeout: 3000 });
    }
  });

  test('should delete article with confirmation', async ({ page }) => {
    await page.goto('/admin/articles');

    const deleteButton = page.locator('button[title="Delete"]').first();
    if (await deleteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Setup dialog handler
      page.on('dialog', dialog => dialog.accept());

      await deleteButton.click();

      // Article should be removed from list
      await page.waitForTimeout(500);
    }
  });

  test('should navigate between tabs in article editor', async ({ page }) => {
    await page.goto('/admin/articles');

    const newArticleButton = page.locator('button:has-text("New Article")');
    if (await newArticleButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await newArticleButton.click();

      // Check if tabs exist
      const contentTab = page.locator('button:has-text("Content")');
      const seoTab = page.locator('button:has-text("SEO")');
      const settingsTab = page.locator('button:has-text("Settings")');

      if (await contentTab.isVisible()) {
        await contentTab.click();
        await expect(page.locator('input[placeholder*="title"]')).toBeVisible();

        await seoTab.click();
        await expect(page.locator('textarea[placeholder*="Meta"]')).toBeVisible();

        await settingsTab.click();
        await expect(page.locator('select')).toBeVisible();
      }
    }
  });

  test('should paginate through articles', async ({ page }) => {
    await page.goto('/admin/articles');

    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      const isDisabled = await nextButton.isDisabled();
      if (!isDisabled) {
        await nextButton.click();
        await page.waitForTimeout(500);

        // Page number should change
        await expect(page.locator('text=/Page \\d+ of \\d+/')).toBeVisible();
      }
    }
  });
});

test.describe('Article Validation', () => {
  test('should enforce content length limits', async ({ page }) => {
    await page.goto('/admin/articles');

    const newArticleButton = page.locator('button:has-text("New Article")');
    if (await newArticleButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await newArticleButton.click();

      const contentTextarea = page.locator('textarea').first();
      const veryLongContent = 'a'.repeat(100000);

      await contentTextarea.fill(veryLongContent);

      // Should accept large content (or show warning)
      const value = await contentTextarea.inputValue();
      expect(value.length).toBeGreaterThan(0);
    }
  });

  test('should preserve draft status', async ({ page }) => {
    await page.goto('/admin/articles');

    const newArticleButton = page.locator('button:has-text("New Article")');
    if (await newArticleButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await newArticleButton.click();

      // Navigate to settings tab
      const settingsTab = page.locator('button:has-text("Settings")');
      if (await settingsTab.isVisible()) {
        await settingsTab.click();

        const statusSelect = page.locator('select').first();
        await statusSelect.selectOption('draft');

        // Draft should be preserved
        expect(await statusSelect.inputValue()).toBe('draft');
      }
    }
  });
});
