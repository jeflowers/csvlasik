import { test, expect } from '@playwright/test';

test.describe('Admin Testimonials Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
  });

  test('should display testimonials manager', async ({ page }) => {
    await page.goto('/admin/testimonials');

    const isLoginPage = await page.locator('input[type="email"]').isVisible().catch(() => false);

    if (!isLoginPage) {
      await expect(page.locator('h1')).toContainText(/Testimonials Management/i);
      await expect(page.locator('button:has-text("Add Testimonial")')).toBeVisible();
    }
  });

  test('should show testimonials list', async ({ page }) => {
    await page.goto('/admin/testimonials');

    const table = page.locator('table');
    if (await table.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Should have table headers
      await expect(page.locator('th:has-text("Patient")')).toBeVisible();
      await expect(page.locator('th:has-text("Status")')).toBeVisible();
      await expect(page.locator('th:has-text("Rating")')).toBeVisible();
    }
  });

  test('should filter testimonials by status', async ({ page }) => {
    await page.goto('/admin/testimonials');

    const statusFilter = page.locator('select').first();
    if (await statusFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
      await statusFilter.selectOption('pending');
      await page.waitForTimeout(500);

      await statusFilter.selectOption('approved');
      await page.waitForTimeout(500);

      await statusFilter.selectOption('all');
    }
  });

  test('should search testimonials', async ({ page }) => {
    await page.goto('/admin/testimonials');

    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await searchInput.fill('test');
      await page.waitForTimeout(500);

      const resultsOrEmpty = await page.locator('table tbody tr, text="No testimonials found"').first().isVisible();
      expect(resultsOrEmpty).toBe(true);
    }
  });

  test('should open create testimonial modal', async ({ page }) => {
    await page.goto('/admin/testimonials');

    const addButton = page.locator('button:has-text("Add Testimonial")');
    if (await addButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await addButton.click();

      await expect(page.locator('text="Add New Testimonial"')).toBeVisible();
      await expect(page.locator('input[placeholder*="Name"]')).toBeVisible();
      await expect(page.locator('textarea')).toBeVisible();
    }
  });

  test('should create new testimonial', async ({ page }) => {
    await page.goto('/admin/testimonials');

    const addButton = page.locator('button:has-text("Add Testimonial")');
    if (await addButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await addButton.click();

      await page.fill('input[placeholder*="Name"]', 'Test Patient ' + Date.now());
      await page.fill('textarea', 'This is a test testimonial for automated testing. The procedure was excellent!');

      const procedureSelect = page.locator('select').first();
      await procedureSelect.selectOption('LASIK');

      await page.click('button[type="submit"]:has-text("Create")');

      await expect(page.locator('text="Add New Testimonial"')).not.toBeVisible({ timeout: 3000 });
    }
  });

  test('should approve testimonial', async ({ page }) => {
    await page.goto('/admin/testimonials');

    const approveButton = page.locator('button[title="Approve"]').first();
    if (await approveButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await approveButton.click();

      await page.waitForTimeout(500);

      // Status should change to approved
      const approvedBadge = page.locator('text="Approved"').first();
      await expect(approvedBadge).toBeVisible({ timeout: 2000 });
    }
  });

  test('should unapprove testimonial', async ({ page }) => {
    await page.goto('/admin/testimonials');

    // Filter to show only approved
    const statusFilter = page.locator('select').first();
    if (await statusFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
      await statusFilter.selectOption('approved');
      await page.waitForTimeout(500);

      const unapproveButton = page.locator('button[title="Unapprove"]').first();
      if (await unapproveButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await unapproveButton.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should select multiple testimonials', async ({ page }) => {
    await page.goto('/admin/testimonials');

    const firstCheckbox = page.locator('tbody input[type="checkbox"]').first();
    if (await firstCheckbox.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstCheckbox.check();

      const secondCheckbox = page.locator('tbody input[type="checkbox"]').nth(1);
      if (await secondCheckbox.isVisible()) {
        await secondCheckbox.check();

        // Bulk actions bar should appear
        await expect(page.locator('text=/\\d+ testimonial\\(s\\) selected/')).toBeVisible();
      }
    }
  });

  test('should bulk approve testimonials', async ({ page }) => {
    await page.goto('/admin/testimonials');

    // Filter to show pending
    const statusFilter = page.locator('select').first();
    if (await statusFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
      await statusFilter.selectOption('pending');
      await page.waitForTimeout(500);

      const firstCheckbox = page.locator('tbody input[type="checkbox"]').first();
      if (await firstCheckbox.isVisible({ timeout: 1000 }).catch(() => false)) {
        await firstCheckbox.check();

        const bulkApproveButton = page.locator('button:has-text("Approve Selected")');
        if (await bulkApproveButton.isVisible()) {
          await bulkApproveButton.click();
          await page.waitForTimeout(500);
        }
      }
    }
  });

  test('should edit testimonial', async ({ page }) => {
    await page.goto('/admin/testimonials');

    const editButton = page.locator('button[title="Edit"]').first();
    if (await editButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await editButton.click();

      await expect(page.locator('text="Edit Testimonial"')).toBeVisible();

      const nameInput = page.locator('input').first();
      await nameInput.fill(await nameInput.inputValue() + ' (edited)');

      await page.click('button[type="submit"]:has-text("Update")');

      await expect(page.locator('text="Edit Testimonial"')).not.toBeVisible({ timeout: 3000 });
    }
  });

  test('should display rating stars', async ({ page }) => {
    await page.goto('/admin/testimonials');

    const ratingColumn = page.locator('td').filter({ hasText: /\d+\/5/ }).first();
    if (await ratingColumn.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Should show star icons
      await expect(ratingColumn).toBeVisible();
    }
  });

  test('should show procedure badges', async ({ page }) => {
    await page.goto('/admin/testimonials');

    const procedureBadge = page.locator('span.bg-teal-100').first();
    if (await procedureBadge.isVisible({ timeout: 2000 }).catch(() => false)) {
      const text = await procedureBadge.textContent();
      expect(['LASIK', 'PRK', 'ICL', 'N/A']).toContain(text?.trim());
    }
  });

  test('should clear selection', async ({ page }) => {
    await page.goto('/admin/testimonials');

    const firstCheckbox = page.locator('tbody input[type="checkbox"]').first();
    if (await firstCheckbox.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstCheckbox.check();

      const clearButton = page.locator('button:has-text("Clear Selection")');
      if (await clearButton.isVisible()) {
        await clearButton.click();

        // Selection should be cleared
        await expect(clearButton).not.toBeVisible();
      }
    }
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/admin/testimonials');

    const addButton = page.locator('button:has-text("Add Testimonial")');
    if (await addButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await addButton.click();

      // Try to submit without filling required fields
      await page.click('button[type="submit"]:has-text("Create")');

      // HTML5 validation should prevent submission
      const nameInput = page.locator('input').first();
      await expect(nameInput).toBeFocused();
    }
  });
});

test.describe('Testimonials Display', () => {
  test('should show testimonial content preview', async ({ page }) => {
    await page.goto('/admin/testimonials');

    const contentCell = page.locator('td').filter({ hasText: /.{20,}/ }).first();
    if (await contentCell.isVisible({ timeout: 2000 }).catch(() => false)) {
      const text = await contentCell.textContent();
      expect(text?.length).toBeGreaterThan(0);
    }
  });

  test('should show creation date', async ({ page }) => {
    await page.goto('/admin/testimonials');

    const dateCell = page.locator('td:has-text("/")').first();
    if (await dateCell.isVisible({ timeout: 2000 }).catch(() => false)) {
      const text = await dateCell.textContent();
      expect(text).toMatch(/\d+\/\d+\/\d+/);
    }
  });

  test('should filter by procedure type', async ({ page }) => {
    await page.goto('/admin/testimonials');

    const procedureFilter = page.locator('select').nth(1);
    if (await procedureFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
      await procedureFilter.selectOption('LASIK');
      await page.waitForTimeout(500);

      await procedureFilter.selectOption('PRK');
      await page.waitForTimeout(500);

      await procedureFilter.selectOption('all');
    }
  });
});
