import { test, expect, type Page, type BrowserContext } from '@playwright/test';

const PUBLIC_PAGES = [
  '/',
  '/contact',
  '/media',
  '/pacific-story',
  '/technology',
  '/testimonials',
  '/procedures/lasik',
  '/privacy-policy',
  '/consent-preferences',
];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const THIRD_PARTY_FRAME = /google\.com|youtube|vimeo/i;

function trackCookieHeaders(page: Page) {
  const sent: string[] = [];
  page.on('request', async (req) => {
    const headers = await req.allHeaders();
    if (headers['cookie']) sent.push(`${req.url()} -> ${headers['cookie']}`);
  });
  return sent;
}

async function expectNoCookies(context: BrowserContext, page: Page) {
  expect(await context.cookies()).toEqual([]);
  expect(await page.evaluate(() => document.cookie)).toBe('');
}

function thirdPartyFrames(page: Page) {
  return page.frames().filter((f) => THIRD_PARTY_FRAME.test(f.url()));
}

test.describe('Cookie consent compliance', () => {
  for (const path of PUBLIC_PAGES) {
    test(`no cookies set or sent before consent on ${path}`, async ({ context, page }) => {
      const sent = trackCookieHeaders(page);
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      await expect(page.getByTestId('consent-banner')).toBeVisible();
      await expectNoCookies(context, page);
      expect(sent).toEqual([]);
      expect(thirdPartyFrames(page)).toEqual([]);
    });
  }

  test('map stays behind a placeholder before consent', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.getByTestId('map-placeholder')).toBeVisible();
    await expect(page.getByTestId('map-iframe')).toHaveCount(0);
  });

  test('accepting all sets only the consent and visitor cookies and loads the map', async ({ context, page }) => {
    await page.goto('/contact');
    await page.getByTestId('consent-accept-all').click();

    await expect(page.getByTestId('consent-banner')).toBeHidden();
    const cookies = await context.cookies();
    expect(cookies.map((c) => c.name).sort()).toEqual(['gdpr_consent', 'visitor_id']);
    expect(cookies.find((c) => c.name === 'visitor_id')!.value).toMatch(UUID);
    await expect(page.getByTestId('map-iframe')).toBeVisible();
  });

  test('necessary-only sets only the consent and visitor cookies and keeps the map gated', async ({ context, page }) => {
    await page.goto('/contact');
    await page.getByTestId('consent-necessary-only').click();

    await expect(page.getByTestId('consent-banner')).toBeHidden();
    const cookies = await context.cookies();
    expect(cookies.map((c) => c.name).sort()).toEqual(['gdpr_consent', 'visitor_id']);
    const consentCookie = cookies.find((c) => c.name === 'gdpr_consent')!;
    const consent = JSON.parse(decodeURIComponent(consentCookie.value));
    expect(consent.marketing).toBe(false);

    await expect(page.getByTestId('map-placeholder')).toBeVisible();
    await expect(page.getByTestId('map-iframe')).toHaveCount(0);

    await page.getByTestId('map-load-button').click();
    await expect(page.getByTestId('map-iframe')).toBeVisible();
  });

  test('consent choice persists across reloads', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('consent-necessary-only').click();
    await page.reload();
    await expect(page.getByTestId('consent-banner')).toHaveCount(0);
  });

  test('privacy page shows consent status for visitors who are not signed in', async ({ context, page }) => {
    await page.goto('/privacy-policy');
    const status = page.getByTestId('consent-status');
    await expect(status).toContainText('No consent recorded on this device.');
    await expectNoCookies(context, page);

    await page.getByTestId('consent-necessary-only').click();
    await expect(status).not.toContainText('No consent recorded on this device.');
    await expect(status).toContainText('Allowed');
    await expect(status).toContainText('Declined');

    await page.reload();
    await expect(status).toContainText(/Consent recorded on|Your choices are saved on this device\./);
  });

  test('withdrawing consent removes the consent and visitor cookies', async ({ context, page }) => {
    await page.goto('/consent-preferences');
    await page.getByTestId('consent-accept-all').click();
    await expect.poll(async () => (await context.cookies()).map((c) => c.name).sort()).toEqual(['gdpr_consent', 'visitor_id']);

    await page.getByTestId('consent-tab-export').click();
    page.once('dialog', (d) => d.accept());
    await page.getByTestId('consent-withdraw-all').click();
    await expect.poll(async () => (await context.cookies()).length).toBe(0);
  });
});
