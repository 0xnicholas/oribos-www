import { expect, test, type Locator, type Page } from '@playwright/test';

const MISSING_PATH = '/definitely-not-a-page/';

const HEADER_ITEMS = [
  'Framework',
  'Platform',
  'FDE + Support',
  'Solutions',
  'Resources',
  'Docs',
  'GitHub',
];

const SOLUTIONS_ORDER = [
  'Customer-facing agents',
  'Operations agents',
  'Developer infrastructure',
  'Sales agents',
  'Marketing agents',
];

async function topLevelLabels(list: Locator) {
  return list.evaluateAll((items) =>
    items.map((item) => {
      const control = item.querySelector(
        ':scope > button, :scope > a, :scope > details > summary',
      );
      return control?.getAttribute('data-nav-label') ?? '';
    }),
  );
}

async function openPanel(page: Page, triggerName: string) {
  const trigger = page.getByRole('navigation', { name: 'Primary' }).getByRole('button', { name: triggerName });
  const panelId = await trigger.getAttribute('aria-controls');

  expect(panelId).toBeTruthy();
  await trigger.click();

  return { trigger, panel: page.locator(`#${panelId}`) };
}

function maxDurationSeconds(value: string): number {
  return Math.max(
    ...value.split(',').map((part) => {
      const trimmed = part.trim();
      const amount = Number.parseFloat(trimmed);
      return trimmed.endsWith('ms') ? amount / 1000 : amount;
    }),
  );
}

test.describe('site chrome', () => {
  test.use({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });

  test('renders the locked header order and no retired entries', async ({ page }) => {
    await page.goto(MISSING_PATH);

    const nav = page.getByRole('navigation', { name: 'Primary' });
    await expect(nav).toBeVisible();
    expect(await topLevelLabels(nav.locator(':scope > ul > li'))).toEqual(HEADER_ITEMS);

    const header = page.locator('header');
    await expect(nav.getByText('Planned', { exact: true })).toBeVisible();
    await expect(header.getByText('Pricing', { exact: true })).toHaveCount(0);
    await expect(header.getByText('Blog', { exact: true })).toHaveCount(0);
    await expect(header.locator('input, [role="search"]')).toHaveCount(0);
    await expect(
      header.locator(
        'a[href*="twitter.com"], a[href*="x.com"], a[href*="linkedin.com"], a[href*="discord"]',
      ),
    ).toHaveCount(0);

    await expect(header.getByRole('link', { name: 'Get started' })).toHaveAttribute(
      'href',
      '/docs/get-started/quickstart/',
    );
    await expect(header.getByRole('link', { name: 'Talk to us' })).toHaveAttribute(
      'href',
      '/fde-support/',
    );
    await expect(header.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/0xnicholas/oribos-framework',
    );
  });

  test('opens a mega menu on click and returns focus on Escape', async ({ page }) => {
    await page.goto(MISSING_PATH);

    const { trigger, panel } = await openPanel(page, 'Framework');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('opens a mega menu from the keyboard and tabs into the panel', async ({ page }) => {
    await page.goto(MISSING_PATH);

    const nav = page.getByRole('navigation', { name: 'Primary' });
    const trigger = nav.getByRole('button', { name: 'Framework' });
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    const panel = page.locator(`#${await trigger.getAttribute('aria-controls')}`);
    await page.keyboard.press('Tab');
    await expect(panel.getByRole('link').first()).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();

    await page.keyboard.press('Space');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  test('closes a mega menu on an outside click', async ({ page }) => {
    await page.goto(MISSING_PATH);

    const { trigger, panel } = await openPanel(page, 'Framework');
    await expect(panel).toBeVisible();

    await page.getByRole('heading', { level: 1 }).click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toBeHidden();
  });

  test('uses the locked Solutions and Resources items and order', async ({ page }) => {
    await page.goto(MISSING_PATH);

    const solutions = await openPanel(page, 'Solutions');
    expect(await solutions.panel.locator('a').evaluateAll((links) => links.map((link) => link.getAttribute('data-nav-label')))).toEqual(
      SOLUTIONS_ORDER,
    );
    await solutions.trigger.click();

    const resources = await openPanel(page, 'Resources');
    expect(await resources.panel.locator('a').evaluateAll((links) => links.map((link) => link.getAttribute('data-nav-label')))).toEqual([
      'Templates',
      'Changelog',
    ]);
  });

  test('renders the footer groups and legal row without retired blocks', async ({ page }) => {
    await page.goto(MISSING_PATH);

    const footer = page.locator('footer');
    expect(await footer.locator('nav').evaluateAll((navs) => navs.map((nav) => nav.getAttribute('aria-label')))).toEqual([
      'Developers',
      'Resources',
      'Company',
    ]);

    const legal = footer.locator('[data-legal]');
    await expect(legal).toContainText('© 2026 Oribos');
    await expect(legal.getByRole('link', { name: 'License' })).toHaveAttribute(
      'href',
      'https://github.com/0xnicholas/oribos-framework/blob/main/LICENSE',
    );
    await expect(legal.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/0xnicholas/oribos-framework',
    );
    await expect(footer.locator('input')).toHaveCount(0);
    await expect(footer.getByText(/Pricing|Blog|Newsletter|Contact/)).toHaveCount(0);
  });

  test('makes the skip link the first focusable element', async ({ page }) => {
    await page.goto(MISSING_PATH);
    await page.keyboard.press('Tab');

    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await expect(skip).toHaveAttribute('href', '#main');
  });

  test('theme toggle is a 32px switch that persists oribos-theme', async ({ page }) => {
    await page.goto(MISSING_PATH);

    const toggle = page.getByRole('switch');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-label', 'Dark theme');
    const box = await toggle.boundingBox();
    expect(box).not.toBeNull();
    expect(box?.width).toBe(32);
    expect(box?.height).toBe(32);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(toggle).toHaveAttribute('aria-checked', 'true');

    const readThemeColor = () =>
      page.evaluate(() => ({
        meta: document.querySelector('meta[name="theme-color"]')?.getAttribute('content') ?? '',
        surface: getComputedStyle(document.documentElement)
          .getPropertyValue('--surface-0')
          .trim(),
      }));

    const initialColor = await readThemeColor();
    expect(initialColor.meta).not.toBe('');
    expect(initialColor.meta).toBe(initialColor.surface);

    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await expect(toggle).toHaveAttribute('aria-label', 'Dark theme');
    expect(await page.evaluate(() => localStorage.getItem('oribos-theme'))).toBe('light');

    const lightColor = await readThemeColor();
    expect(lightColor.meta).not.toBe('');
    expect(lightColor.meta).toBe(lightColor.surface);
    expect(lightColor.meta).not.toBe(initialColor.meta);

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(page.getByRole('switch', { name: 'Dark theme' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  test('reduced motion removes transitions and animations', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(MISSING_PATH);

    const durations = await page.evaluate(() => {
      const read = (selector: string) => {
        const element = document.querySelector<HTMLElement>(selector);
        if (!element) return null;
        const style = getComputedStyle(element);
        return { transition: style.transitionDuration, animation: style.animationDuration };
      };

      return {
        trigger: read('[data-menu-trigger]'),
        toggle: read('[data-theme-toggle]'),
        scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
      };
    });

    expect(durations.trigger).not.toBeNull();
    expect(durations.toggle).not.toBeNull();
    expect(maxDurationSeconds(durations.trigger?.transition ?? '0s')).toBeLessThanOrEqual(0.001);
    expect(maxDurationSeconds(durations.trigger?.animation ?? '0s')).toBeLessThanOrEqual(0.001);
    expect(maxDurationSeconds(durations.toggle?.transition ?? '0s')).toBeLessThanOrEqual(0.001);
    expect(durations.scrollBehavior).toBe('auto');
  });

  for (const width of [320, 390, 768, 1024, 1328, 1440]) {
    test(`has no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(MISSING_PATH);

      const widthInfo = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));

      expect(widthInfo.scrollWidth).toBeLessThanOrEqual(widthInfo.clientWidth);
    });
  }
});

test.describe('mobile drawer', () => {
  test.use({ viewport: { width: 390, height: 844 }, colorScheme: 'dark' });

  test('uses the same items and order as the desktop navigation', async ({ page }) => {
    await page.goto(MISSING_PATH);
    await page.getByRole('button', { name: 'Menu' }).click();

    const dialog = page.getByRole('dialog', { name: 'Menu' });
    await expect(dialog).toBeVisible();
    expect(await topLevelLabels(dialog.locator('.drawer-nav > li'))).toEqual(HEADER_ITEMS);
    await expect(dialog.getByText('Planned', { exact: true })).toBeVisible();
    await expect(dialog.getByRole('link', { name: 'Get started' })).toBeVisible();
    await expect(dialog.getByRole('link', { name: 'Talk to us' })).toBeVisible();
  });

  test('traps focus, locks body scroll, closes on Escape, and returns focus', async ({ page }) => {
    await page.goto(MISSING_PATH);

    const menuButton = page.getByRole('button', { name: 'Menu' });
    await menuButton.click();

    const dialog = page.getByRole('dialog', { name: 'Menu' });
    await expect(dialog).toBeVisible();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe('hidden');

    const first = dialog
      .locator('.drawer-nav > li')
      .first()
      .locator(':scope > details > summary, :scope > a');
    await expect(first).toBeFocused();

    await page.keyboard.press('Shift+Tab');
    await expect(dialog.getByRole('link', { name: 'Talk to us' })).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(first).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await expect(menuButton).toBeFocused();
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe('hidden');
  });
});
