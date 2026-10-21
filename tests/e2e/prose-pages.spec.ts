import { expect, test, type Page } from '@playwright/test';

const PAGES = [
  { path: '/about/', h1: 'About Oribos' },
  { path: '/privacy-policy/', h1: 'Privacy policy' },
  { path: '/terms-of-service/', h1: 'Terms of service' },
] as const;

const PROSE_ROUTES = ['/about/', '/privacy-policy/', '/terms-of-service/'];

async function primaryLabels(page: Page): Promise<string[]> {
  return page
    .getByRole('navigation', { name: 'Primary' })
    .locator('[data-nav-label]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-nav-label') ?? ''));
}

for (const { path, h1 } of PAGES) {
  test.describe(`prose page ${path}`, () => {
    test('returns 200, has exactly one H1, and uses the shared chrome', async ({ page }) => {
      const response = await page.goto(path);

      expect(response?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(h1);
      await expect(page.locator('header[data-site-header]')).toBeVisible();
      await expect(page.locator('footer.site-footer')).toBeVisible();
      await expect(page.locator('main#main')).toHaveCount(1);
    });

    test('resolves every in-page link to another prose page', async ({ page, request }) => {
      await page.goto(path);

      const hrefs = await page
        .locator('main a[href^="/"]')
        .evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute('href') ?? ''));
      const builtLinks = [...new Set(hrefs.filter((href) => PROSE_ROUTES.includes(href)))];

      for (const href of builtLinks) {
        expect((await request.get(href)).status(), `${href} linked from ${path}`).toBe(200);
      }
    });
  });
}

test('keeps the locked primary navigation across the prose pages', async ({ page }) => {
  const variants = [];

  for (const { path } of PAGES) {
    await page.goto(path);
    await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
    variants.push((await primaryLabels(page)).join('|'));
  }

  expect(new Set(variants).size).toBe(1);
});

test('shares a footer with working About, Privacy, and Terms links', async ({ page, request }) => {
  await page.goto('/privacy-policy/');

  const company = page.locator('footer').getByRole('navigation', { name: 'Company' });

  for (const [label, href] of [
    ['About', '/about/'],
    ['Privacy', '/privacy-policy/'],
    ['Terms', '/terms-of-service/'],
  ]) {
    await expect(company.getByRole('link', { name: label, exact: true })).toHaveAttribute(
      'href',
      href,
    );
    expect((await request.get(href)).status()).toBe(200);
  }
});

test('About matches the locked positioning', async ({ page }) => {
  await page.goto('/about/');

  const main = page.locator('main');
  await expect(main).toContainText('umbrella brand');
  await expect(main).toContainText('live product');
  await expect(main).toContainText('Platform is planned');
  await expect(main).toContainText('small maintainer-led team');
  await expect(main.locator('a[href="/careers/"], a[href="/team/"]')).toHaveCount(0);
  expect(await main.locator('img').count()).toBe(0);
  await expect(main.getByRole('link', { name: 'GitHub', exact: true })).toHaveAttribute(
    'href',
    'https://github.com/0xnicholas/oribos-framework',
  );
});

test('Privacy policy states the launch data posture and hosting logs', async ({ page }) => {
  await page.goto('/privacy-policy/');

  const main = page.locator('main');
  await expect(main).toContainText('no analytics');
  await expect(main).toContainText('no cookies');
  await expect(main).toContainText('no third-party scripts');
  await expect(main).toContainText('may record standard request logs');
  await expect(main.locator('time')).toHaveAttribute('datetime', '2026-10-21');
});

test('Terms of service states licensing, warranty, SLA, and FDE boundaries', async ({ page }) => {
  await page.goto('/terms-of-service/');

  const main = page.locator('main');
  await expect(main).toContainText('Apache License 2.0');
  await expect(main).toContainText('without warranty');
  await expect(main).toContainText('no service-level agreement');
  await expect(main).toContainText('separately scoped');
  await expect(main.getByRole('link', { name: 'Apache License 2.0', exact: true })).toHaveAttribute(
    'href',
    'https://github.com/0xnicholas/oribos-framework/blob/main/LICENSE',
  );
});
