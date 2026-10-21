import { expect, test, type Page } from '@playwright/test';

const PATH = '/customer-facing-agents/';
const EXAMPLE_BASE = 'https://github.com/0xnicholas/oribos-framework/tree/main/examples';

const SCENARIOS = [
  {
    name: 'Answer, streamed into your UI',
    packages: ['@oribos/core/agent', '@oribos/core/memory', '@oribos/ai-sdk'],
    example: 'ai-chat-route',
    docs: '/docs/concepts/agents/',
  },
  {
    name: 'Act, through your own API',
    packages: ['@oribos/core/tools', '@oribos/core/workflows'],
    example: 'workflow-approval',
    docs: '/docs/concepts/tools/',
  },
  {
    name: 'Hand off, with the run on hold',
    packages: ['@oribos/core/durable-agent', '@oribos/sqlite'],
    example: 'durable-approval',
    docs: '/docs/concepts/suspend-resume/',
  },
] as const;

const PUBLISHED_PACKAGES = [
  '@oribos/core',
  '@oribos/ai-sdk',
  '@oribos/sqlite',
  '@oribos/resumable-stream',
  '@oribos/checkpoints',
] as const;

const FAQ_QUESTIONS = [
  'Do I have to replace my chat UI?',
  'Does Oribos host the agent for me?',
  'Where do authentication and data live?',
] as const;

function sentenceCount(text: string): number {
  return text
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean).length;
}

async function expectNoCustomerProof(page: Page): Promise<void> {
  const main = page.locator('main');

  await expect(
    main.locator('img, blockquote, [data-testimonial], [data-customer-logo]'),
  ).toHaveCount(0);
  await expect(main).not.toContainText(/trusted by|used by \d|testimonial/i);
}

test.describe('customer-facing agents solution page', () => {
  test.use({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });

  test('returns 200 with one H1, the eyebrow, and the locked positioning', async ({ page }) => {
    const response = await page.goto(PATH);

    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Customer-facing agents');
    await expect(page.getByText('SOLUTIONS · CUSTOMER-FACING', { exact: true })).toBeVisible();
    await expect(
      page.getByText('Answer your users, act inside your product, hand off to a human.', {
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.locator('header[data-site-header]')).toBeVisible();
    await expect(page.locator('footer.site-footer')).toBeVisible();
    await expect(page.locator('main#main')).toHaveCount(1);
  });

  test('renders three complete scenario cards', async ({ page }) => {
    await page.goto(PATH);

    const cards = page.locator('[data-scenario-card]');
    await expect(cards).toHaveCount(3);

    for (const scenario of SCENARIOS) {
      const card = cards.filter({ has: page.getByRole('heading', { level: 3, name: scenario.name }) });

      await expect(card).toHaveCount(1);
      await expect(card.locator('.scenario-card__name')).toHaveText(scenario.name);
      expect(sentenceCount(await card.locator('.scenario-card__body').innerText())).toBe(3);

      const packages = await card.locator('.scenario-card__package').allTextContents();
      expect(packages).toEqual(scenario.packages);

      await expect(
        card.getByRole('link', { name: new RegExp(`Example: ${scenario.example}`) }),
      ).toHaveAttribute('href', `${EXAMPLE_BASE}/${scenario.example}`);
      await expect(card.getByRole('link', { name: /^Docs:/ })).toHaveAttribute(
        'href',
        scenario.docs,
      );
    }
  });

  test('shows the reference architecture in order with tools and an approval gate', async ({
    page,
  }) => {
    await page.goto(PATH);

    const architecture = page.locator('[data-architecture]');
    await expect(architecture).toHaveCount(1);

    const labels = await architecture.locator('[data-architecture-label]').allTextContents();
    expect(labels.map((label) => label.trim())).toEqual([
      'Host UI',
      'AI SDK route',
      'Durable agent',
      'Memory store',
    ]);

    await expect(architecture.locator('[data-architecture-tools]')).toContainText(
      'Your API as tools',
    );
    await expect(architecture.locator('[data-architecture-gate]')).toContainText('Approval gate');
    await expect(architecture).toContainText('Nothing executes while the run is suspended.');
  });

  test('names only published 0.9.0 packages', async ({ page }) => {
    await page.goto(PATH);

    const packageMap = page.locator('[data-package-map]');
    const names = await packageMap.locator('tbody th code').allTextContents();

    expect(names).toEqual(PUBLISHED_PACKAGES);
    for (const name of names) {
      expect(name).toMatch(/^@oribos\//);
    }

    const main = page.locator('main');
    for (const unpublished of ['@oribos/lease', '@oribos/testing', '@balsats/']) {
      await expect(main).not.toContainText(unpublished);
    }
    await expect(packageMap).toContainText('published at 0.9.0');
  });

  test('states the three boundaries', async ({ page }) => {
    await page.goto(PATH);

    const boundaries = page.locator('[data-boundary]');
    await expect(boundaries).toHaveCount(3);

    const titles = await boundaries.locator('.boundary__title').allTextContents();
    expect(titles).toEqual([
      'Not a chat product',
      'Not a hosted service',
      'Not a replacement for your auth or data model',
    ]);

    await expect(page.locator('[data-block="boundaries"]')).toContainText(
      'Authentication, authorization, tenancy, and records stay in your system.',
    );
  });

  test('lists runnable examples with their proofs and GitHub sources', async ({ page }) => {
    await page.goto(PATH);

    const examples = page.locator('[data-example]');
    await expect(examples).toHaveCount(3);

    for (const example of ['ai-chat-route', 'workflow-approval', 'durable-approval']) {
      const card = examples.filter({ hasText: example });

      await expect(card.locator('h3 code')).toHaveText(example);
      expect((await card.locator('.example__proof').innerText()).length).toBeGreaterThan(40);
      await expect(card.getByRole('link', { name: /View source on GitHub/ })).toHaveAttribute(
        'href',
        `${EXAMPLE_BASE}/${example}`,
      );
    }
  });

  test('code block comes from an example, links its source, and copies verbatim', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto(PATH);

    const codeBlock = page.locator('[data-code-block]');
    await expect(codeBlock).toHaveCount(1);

    const code = await codeBlock.locator('pre code').textContent();
    expect(code).toBeTruthy();
    const lines = (code ?? '').split('\n');
    expect(lines.length).toBeGreaterThanOrEqual(5);
    expect(lines.length).toBeLessThanOrEqual(15);
    expect(code).toContain(
      "app.durableAgent({ agent, approval: { tools: ['issueRefund'] } })",
    );

    await expect(codeBlock.getByRole('link', { name: 'examples/ai-chat-route/src/index.ts' })).toHaveAttribute(
      'href',
      'https://github.com/0xnicholas/oribos-framework/blob/main/examples/ai-chat-route/src/index.ts#L97-L104',
    );

    await codeBlock.getByRole('button', { name: 'Copy code' }).click();
    await expect(codeBlock.getByText('Copied', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(code);
  });

  test('FAQ uses native details and opens without JavaScript', async ({ page }) => {
    await page.goto(PATH);

    const items = page.locator('[data-faq-item]');
    await expect(items).toHaveCount(3);

    const questions = await items.locator('summary').allTextContents();
    expect(questions).toEqual(FAQ_QUESTIONS);

    const first = items.first();
    await expect(first).not.toHaveAttribute('open', '');
    await first.locator('summary').click();
    await expect(first).toHaveAttribute('open', '');
    await expect(first.locator('.faq__answer')).toBeVisible();
    await first.locator('summary').click();
    await expect(first).not.toHaveAttribute('open', '');
  });

  test('ends with the Quickstart and GitHub CTA and carries no customer proof', async ({
    page,
  }) => {
    await page.goto(PATH);

    const cta = page.locator('main [data-block="cta"]');
    await expect(cta).toHaveCount(1);
    await expect(cta.getByRole('heading', { level: 2 })).toHaveText('Build it into your app.');
    await expect(cta.getByRole('link', { name: 'Quickstart' })).toHaveAttribute(
      'href',
      '/docs/get-started/quickstart/',
    );
    await expect(cta.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/0xnicholas/oribos-framework',
    );
    await expect(page.locator('main')).not.toContainText(/request a demo|join the waitlist/i);

    await expectNoCustomerProof(page);
  });
});

test.describe('customer-facing agents page without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('opens the FAQ with native details semantics', async ({ page }) => {
    await page.goto(PATH);

    const first = page.locator('[data-faq-item]').first();
    await expect(first).not.toHaveAttribute('open', '');
    await first.locator('summary').click();
    await expect(first).toHaveAttribute('open', '');
    await expect(first.locator('.faq__answer')).toBeVisible();
  });
});

test.describe('customer-facing agents responsive layout', () => {
  test.describe('tablet', () => {
    test.use({ viewport: { width: 900, height: 900 } });

    test('lays the card grids out two-up between 768 and 1023', async ({ page }) => {
      await page.goto(PATH);

      for (const selector of ['[data-scenario-card]', '[data-example]', '[data-boundary]']) {
        const columns = await page
          .locator(selector)
          .first()
          .evaluate((card) => {
            const style = getComputedStyle(card.parentElement as HTMLElement);
            return style.gridTemplateColumns.split(' ').filter(Boolean).length;
          });

        expect(columns, selector).toBe(2);
      }
    });
  });

  test.describe('narrow mobile', () => {
    test.use({ viewport: { width: 320, height: 800 } });

    test('does not overflow the page horizontally', async ({ page }) => {
      await page.goto(PATH);

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));

      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    });
  });
});
