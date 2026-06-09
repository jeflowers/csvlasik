import { test, expect } from '@playwright/test';

test.describe('Contact Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('displays contact form and information', async ({ page }) => {
    await expect(page.getByText('Start Your Vision Journey')).toBeVisible();
    
    // Check form fields
    await expect(page.getByLabelText('First Name *')).toBeVisible();
    await expect(page.getByLabelText('Last Name *')).toBeVisible();
    await expect(page.getByLabelText('Email Address *')).toBeVisible();
    await expect(page.getByLabelText('Phone Number *')).toBeVisible();
    
    // Check contact information
    await expect(page.getByText('Lakewood Office')).toBeVisible();
    await expect(page.getByText('(844) 954-8686')).toBeVisible();
    await expect(page.getByText('info@atelierlasik.com')).toBeVisible();
  });

  test('form validation works correctly', async ({ page }) => {
    // Try to submit empty form
    await page.getByText('Schedule My Free Consultation').click();
    
    // Should show validation errors
    const firstNameInput = page.getByLabelText('First Name *');
    await expect(firstNameInput).toHaveAttribute('required');
  });

  test('form submission with valid data', async ({ page }) => {
    // Fill out form
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', 'john.doe@example.com');
    await page.fill('input[name="phone"]', '(555) 123-4567');
    await page.selectOption('select[name="procedure"]', 'lasik');
    await page.fill('textarea[name="message"]', 'I am interested in LASIK surgery.');
    
    // Submit form
    await page.getByText('Schedule My Free Consultation').click();
    
    // Note: In a real test, you'd mock the backend or check for success message
    // For now, we just verify the form can be filled and submitted
  });

  test('procedure selection affects form', async ({ page }) => {
    const procedureSelect = page.locator('select[name="procedure"]');
    
    await procedureSelect.selectOption('lasik');
    await expect(procedureSelect).toHaveValue('lasik');
    
    await procedureSelect.selectOption('prk');
    await expect(procedureSelect).toHaveValue('prk');
    
    await procedureSelect.selectOption('icl');
    await expect(procedureSelect).toHaveValue('icl');
  });

  test('contact methods selection', async ({ page }) => {
    // Check default selection
    const phoneRadio = page.getByRole('radio', { name: 'Phone' });
    await expect(phoneRadio).toBeChecked();
    
    // Select email
    const emailRadio = page.getByRole('radio', { name: 'Email' });
    await emailRadio.click();
    await expect(emailRadio).toBeChecked();
    await expect(phoneRadio).not.toBeChecked();
  });

  test('what to expect section is informative', async ({ page }) => {
    await expect(page.getByText('What to Expect at Your Consultation')).toBeVisible();
    
    // Check consultation steps
    await expect(page.getByText('Comprehensive Eye Exam')).toBeVisible();
    await expect(page.getByText('Personal Consultation')).toBeVisible();
    await expect(page.getByText('Customized Treatment Plan')).toBeVisible();
    
    // Check what to bring section
    await expect(page.getByText('What to Bring')).toBeVisible();
    await expect(page.getByText('Current glasses or contacts')).toBeVisible();
  });

  test('emergency contact information is prominent', async ({ page }) => {
    await expect(page.getByText('Post-Operative Emergency Contact')).toBeVisible();
    await expect(page.getByText('Emergency Line: (844) 954-8686')).toBeVisible();
  });

  test('phone numbers are clickable', async ({ page }) => {
    const phoneLinks = page.getByRole('link', { name: /\(844\) 954-8686/ });
    
    for (const link of await phoneLinks.all()) {
      await expect(link).toHaveAttribute('href', 'tel:+18449548686');
    }
  });

  test('email links are clickable', async ({ page }) => {
    const emailLink = page.getByRole('link', { name: 'info@atelierlasik.com' });
    await expect(emailLink).toHaveAttribute('href', 'mailto:info@atelierlasik.com');
  });

  test('office hours are displayed', async ({ page }) => {
    await expect(page.getByText('Office Hours')).toBeVisible();
    await expect(page.getByText('Monday - Friday: 8:00 AM - 6:00 PM')).toBeVisible();
    await expect(page.getByText('Saturday: 9:00 AM - 3:00 PM')).toBeVisible();
    await expect(page.getByText('Sunday: Closed')).toBeVisible();
  });
});