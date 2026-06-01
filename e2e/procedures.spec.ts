import { test, expect } from '@playwright/test';

test.describe('Procedures Pages', () => {
  test('procedures overview page displays all options', async ({ page }) => {
    await page.goto('/procedures');
    
    await expect(page.getByText('Atelier Vision Correction Options')).toBeVisible();
    
    // Check for all three procedures
    await expect(page.getByText('LASIK')).toBeVisible();
    await expect(page.getByText('PRK')).toBeVisible();
    await expect(page.getByText('ICL')).toBeVisible();
    
    // Check comparison table
    await expect(page.getByText('Side-by-Side Comparison')).toBeVisible();
    await expect(page.getByText('Recovery Time')).toBeVisible();
    await expect(page.getByText('Success Rate')).toBeVisible();
  });

  test('LASIK page displays comprehensive information', async ({ page }) => {
    await page.goto('/procedures/lasik');
    
    await expect(page.getByText('Atelier LASIK Surgery')).toBeVisible();
    
    // Check procedure stats
    await expect(page.getByText('15 min')).toBeVisible();
    await expect(page.getByText('1-2 days')).toBeVisible();
    await expect(page.getByText('98%')).toBeVisible();
    
    // Check for process steps
    await expect(page.getByText('Comprehensive Eye Examination')).toBeVisible();
    await expect(page.getByText('Corneal Flap Creation')).toBeVisible();
    
    // Check testimonials section
    await expect(page.getByText('LASIK Success Stories')).toBeVisible();
  });

  test('PRK page shows surface treatment information', async ({ page }) => {
    await page.goto('/procedures/prk');
    
    await expect(page.getByText('Atelier PRK Surgery')).toBeVisible();
    await expect(page.getByText('Surface Treatment Alternative')).toBeVisible();
    
    // Check recovery timeline
    await expect(page.getByText('PRK Recovery Timeline')).toBeVisible();
    await expect(page.getByText('Days 1-3')).toBeVisible();
    await expect(page.getByText('Initial Healing')).toBeVisible();
    
    // Check ideal candidates section
    await expect(page.getByText('Active Professionals')).toBeVisible();
    await expect(page.getByText('Thin Corneas')).toBeVisible();
  });

  test('ICL page explains implantable solution', async ({ page }) => {
    await page.goto('/procedures/icl');
    
    await expect(page.getByText('Atelier ICL Surgery')).toBeVisible();
    await expect(page.getByText('Implantable Solution')).toBeVisible();
    
    // Check unique advantages
    await expect(page.getByText('Reversible')).toBeVisible();
    await expect(page.getByText('Superior Vision Quality')).toBeVisible();
    await expect(page.getByText('UV Protection')).toBeVisible();
    
    // Check comparison with laser surgery
    await expect(page.getByText('ICL vs Laser Surgery')).toBeVisible();
  });

  test('procedure pages have consistent CTAs', async ({ page }) => {
    const procedures = ['/procedures/lasik', '/procedures/prk', '/procedures/icl'];
    
    for (const procedureUrl of procedures) {
      await page.goto(procedureUrl);
      
      // Each page should have consultation CTA
      await expect(page.getByText(/Schedule.*Consultation/)).toBeVisible();
      
      // Each page should have comparison link
      await expect(page.getByText(/Compare.*Procedures/)).toBeVisible();
    }
  });

  test('procedure navigation between pages works', async ({ page }) => {
    await page.goto('/procedures/lasik');
    
    // Navigate to comparison
    await page.getByText('Compare Procedures').click();
    await expect(page).toHaveURL('/procedures');
    
    // Navigate to PRK
    await page.getByText('Learn More About PRK').click();
    await expect(page).toHaveURL('/procedures/prk');
  });

  test('consultation scheduling from procedure pages', async ({ page }) => {
    await page.goto('/procedures/lasik');
    
    await page.getByText('Schedule Free Consultation').first().click();
    await expect(page).toHaveURL('/contact');
    
    // Should have LASIK pre-selected in form
    const procedureSelect = page.locator('select[name="procedure"]');
    await expect(procedureSelect).toHaveValue('lasik');
  });
});