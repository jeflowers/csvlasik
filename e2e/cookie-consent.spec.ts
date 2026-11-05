import { test, expect, type Page, type BrowserContext } from '@playwright/test';

const PUBLIC_PAGES = ['/', '/contact', '/media', '/pacific-story', '/technology', '/testimonials', '/procedures/lasik'];
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

  test('accepting all sets only the consent cookie and loads the map', async ({ context, page }) => {
    await page.goto('/contact');
    await page.getByTestId('consent-accept-all').click();

    await expect(page.getByTestId('consent-banner')).toBeHidden();
    const cookies = await context.cookies();
    expect(cookies.map((c) => c.name)).toEqual(['gdpr_consent']);
    await expect(page.getByTestId('map-iframe')).toBeVisible();
  });

  test('necessary-only sets only the consent cookie and keeps the map gated', async ({ context, page }) => {
    await page.goto('/contact');
    await page.getByTestId('consent-necessary-only').click();

    await expect(page.getByTestId('consent-banner')).toBeHidden();
    const cookies = await context.cookies();
    expect(cookies.map((c) => c.name)).toEqual(['gdpr_consent']);
    const consent = JSON.parse(decodeURIComponent(cookies[0].value));
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
});
