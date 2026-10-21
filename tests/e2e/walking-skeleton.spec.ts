import { expect, test, type Browser } from '@playwright/test';

const MISSING_PATH = '/definitely-not-a-page/';

interface ThemePreference {
  colorScheme: 'dark' | 'light';
  stored?: string;
}

async function readTheme(browser: Browser, preference: ThemePreference) {
  const context = await browser.newContext({ colorScheme: preference.colorScheme });

  if (preference.stored !== undefined) {
    await context.addInitScript((value) => localStorage.setItem('oribos-theme', value), preference.stored);
  }

  const page = await context.newPage();
  await page.goto(MISSING_PATH);

  const theme = await page.locator('html').getAttribute('data-theme');
  const inlineColorScheme = await page.evaluate(() => document.documentElement.style.colorScheme);

  await context.close();

  return { theme, colorScheme: inlineColorScheme };
}

test.describe('walking skeleton', () => {
  test('serves the 404 page with a real 404 status and no external requests', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (request) => requests.push(request.url()));

    const response = await page.goto(MISSING_PATH);
    expect(response?.status()).toBe(404);

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');

    const origin = new URL(page.url()).origin;
    const externalRequests = requests.filter((url) => new URL(url).origin !== origin);
    expect(externalRequests).toEqual([]);
  });

  test('returns status 404 for the 404 route itself', async ({ request }) => {
    for (const path of ['/404', '/404/', '/404.html']) {
      const response = await request.get(path);
      expect(response.status()).toBe(404);
      expect(await response.text()).toContain('Page not found');
    }
  });

  test('marks the 404 page noindex and emits no canonical', async ({ request }) => {
    const response = await request.get(MISSING_PATH);
    expect(response.status()).toBe(404);

    const html = await response.text();
    expect(html).toMatch(/<meta\s+name=["']robots["']\s+content=["']noindex["']/i);
    expect(html).not.toMatch(/<link[^>]+rel=["']canonical["'][^>]*>/i);
  });

  test('offers the recovery links from the 404 outline', async ({ page }) => {
    await page.goto(MISSING_PATH);

    const links = page.locator('main nav[aria-label="Site"] a');
    await expect(links).toHaveCount(3);
    expect(await links.evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute('href')))).toEqual([
      '/',
      '/docs/',
      '/templates/',
    ]);
  });

  test('runs the theme boot script before any stylesheet or style block', async ({ request }) => {
    const response = await request.get(MISSING_PATH);
    const html = await response.text();

    const scriptIndex = html.indexOf('oribos-theme');
    const styleIndexes = [
      html.search(/<link[^>]+rel=["']stylesheet["']/i),
      html.search(/<style[\s>]/i),
    ].filter((index) => index >= 0);

    expect(scriptIndex).toBeGreaterThan(-1);
    expect(styleIndexes.length).toBeGreaterThan(0);
    expect(scriptIndex).toBeLessThan(Math.min(...styleIndexes));
  });

  test('defaults to dark when the OS prefers dark', async ({ browser }) => {
    expect(await readTheme(browser, { colorScheme: 'dark' })).toEqual({
      theme: 'dark',
      colorScheme: 'dark',
    });
  });

  test('uses light when the OS prefers light', async ({ browser }) => {
    expect(await readTheme(browser, { colorScheme: 'light' })).toEqual({
      theme: 'light',
      colorScheme: 'light',
    });
  });

  test('lets a stored light theme override a dark OS preference', async ({ browser }) => {
    expect(await readTheme(browser, { colorScheme: 'dark', stored: 'light' })).toEqual({
      theme: 'light',
      colorScheme: 'light',
    });
  });

  test('lets a stored dark theme override a light OS preference', async ({ browser }) => {
    expect(await readTheme(browser, { colorScheme: 'light', stored: 'dark' })).toEqual({
      theme: 'dark',
      colorScheme: 'dark',
    });
  });

  test('ignores an invalid stored theme and falls back to the OS preference', async ({ browser }) => {
    expect(await readTheme(browser, { colorScheme: 'light', stored: 'sepia' })).toEqual({
      theme: 'light',
      colorScheme: 'light',
    });
  });

  test('self-hosts the font and favicon assets', async ({ request }) => {
    const response = await request.get(MISSING_PATH);
    const html = await response.text();

    expect(html).toContain('/fonts/inter-latin-wght-normal.woff2');
    expect(html).toContain('/favicon.svg');
    expect(html).not.toMatch(/https?:\/\/(?!127\.0\.0\.1|localhost)[^"'\s]+\.(?:woff2?|css|js)/i);

    const font = await request.get('/fonts/inter-latin-wght-normal.woff2');
    expect(font.status()).toBe(200);
    expect(font.headers()['content-type']).toContain('font/woff2');

    const favicon = await request.get('/favicon.svg');
    expect(favicon.status()).toBe(200);
    expect(favicon.headers()['content-type']).toContain('image/svg+xml');

    for (const path of ['/favicon-32.png', '/favicon-16.png', '/apple-touch-icon.png']) {
      const icon = await request.get(path);
      expect(icon.status()).toBe(200);
      expect(icon.headers()['content-type']).toContain('image/png');
    }
  });
});
