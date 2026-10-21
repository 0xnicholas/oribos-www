import { expect, test, type Locator, type Page } from '@playwright/test';

import { expectNoCustomerProof, sentenceCount } from './solution-helpers';

const EXAMPLE_TREE = 'https://github.com/0xnicholas/oribos-framework/tree/main/examples';
export const EXAMPLE_BLOB = 'https://github.com/0xnicholas/oribos-framework/blob/main/examples';

const PUBLISHED_PACKAGES = new Set([
  '@oribos/core',
  '@oribos/ai-sdk',
  '@oribos/background-tasks',
  '@oribos/checkpoints',
  '@oribos/croner',
  '@oribos/distributed-signals',
  '@oribos/evals',
  '@oribos/inngest',
  '@oribos/mcp-client',
  '@oribos/mcp-server',
  '@oribos/model-router',
  '@oribos/observational-memory',
  '@oribos/otel-bridge',
  '@oribos/otlp',
  '@oribos/rag',
  '@oribos/resumable-stream',
  '@oribos/semconv',
  '@oribos/sqlite',
  '@oribos/supervisor',
]);

export interface ScenarioSpec {
  name: string;
  packages: string[];
  example: string;
  docs: string;
}

export interface SolutionPageSpec {
  path: string;
  h1: string;
  eyebrow: string;
  positioning: string;
  scenarios: ScenarioSpec[];
  architecture: {
    nodes: string[];
    edgeLabels: string[];
    toolsText: string;
    gateText: string;
    caption: string;
  };
  packages: string[];
  boundaries: string[];
  examples: string[];
  code: {
    filename: string;
    sourceHref: string;
    lines: number;
    contains: string[];
  };
  faqs: string[];
  cta: string;
  boundaryClaims?: string[];
  colorScheme?: 'light' | 'dark';
}

const UNPUBLISHED = [
  '@oribos/lease',
  '@oribos/testing',
  '@balsats/',
  '@oribos/core/agent-run',
  '@oribos/core/output-object',
];

function columnCount(locator: Locator): Promise<number> {
  return locator.evaluate((element) =>
    getComputedStyle(element).gridTemplateColumns.split(' ').filter(Boolean).length,
  );
}

async function openFirstFaq(page: Page): Promise<Locator> {
  const first = page.locator('[data-faq-item]').first();
  await expect(first).not.toHaveAttribute('open', '');
  await first.locator('summary').click();
  await expect(first).toHaveAttribute('open', '');
  await expect(first.locator('.faq__answer')).toBeVisible();
  return first;
}

export function registerSolutionPageTests(specs: readonly SolutionPageSpec[]): void {
  for (const spec of specs) {
    test.describe(`${spec.path} solution page`, () => {
      test.use({
        viewport: { width: 1440, height: 900 },
        colorScheme: spec.colorScheme ?? 'light',
      });

      test('returns 200 with one H1, the eyebrow, and the locked positioning', async ({ page }) => {
        const response = await page.goto(spec.path);

        expect(response?.status()).toBe(200);
        await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(spec.h1);
        await expect(page.getByText(spec.eyebrow, { exact: true })).toBeVisible();
        await expect(page.getByText(spec.positioning, { exact: true })).toBeVisible();
        await expect(page.locator('header[data-site-header]')).toBeVisible();
        await expect(page.locator('footer.site-footer')).toBeVisible();
        await expect(page.locator('main#main')).toHaveCount(1);
      });

      test('renders three complete scenario cards', async ({ page }) => {
        await page.goto(spec.path);

        const cards = page.locator('[data-scenario-card]');
        await expect(cards).toHaveCount(3);

        for (const scenario of spec.scenarios) {
          const card = cards.filter({
            has: page.getByRole('heading', { level: 3, name: scenario.name }),
          });

          await expect(card).toHaveCount(1);
          await expect(card.locator('.scenario-card__name')).toHaveText(scenario.name);

          const sentences = sentenceCount(await card.locator('.scenario-card__body').innerText());
          expect(sentences, scenario.name).toBeGreaterThanOrEqual(2);
          expect(sentences, scenario.name).toBeLessThanOrEqual(3);

          const packages = await card.locator('.scenario-card__package').allTextContents();
          expect(packages).toEqual(scenario.packages);

          await expect(
            card.getByRole('link', { name: new RegExp(`Example: ${scenario.example}`) }),
          ).toHaveAttribute('href', `${EXAMPLE_TREE}/${scenario.example}`);
          await expect(card.getByRole('link', { name: /^Docs:/ })).toHaveAttribute(
            'href',
            scenario.docs,
          );
        }
      });

      test('shows the reference architecture with its nodes, edges, and caption', async ({
        page,
      }) => {
        await page.goto(spec.path);

        const architecture = page.locator('[data-architecture]');
        await expect(architecture).toHaveCount(1);

        const labels = await architecture.locator('[data-architecture-label]').allTextContents();
        expect(labels.map((label) => label.trim())).toEqual(spec.architecture.nodes);

        const edgeTitles = await architecture.locator('.architecture__edge-title').allTextContents();
        expect(edgeTitles).toEqual(spec.architecture.edgeLabels);

        await expect(architecture.locator('[data-architecture-tools]')).toContainText(
          spec.architecture.toolsText,
        );
        await expect(architecture.locator('[data-architecture-gate]')).toContainText(
          spec.architecture.gateText,
        );
        await expect(architecture.locator('.architecture__caption')).toHaveText(
          spec.architecture.caption,
        );
      });

      test('names only published 0.9.0 packages', async ({ page }) => {
        await page.goto(spec.path);

        const packageMap = page.locator('[data-package-map]');
        const names = await packageMap.locator('tbody th code').allTextContents();

        expect(names).toEqual(spec.packages);
        for (const name of names) {
          expect(name).toMatch(/^@oribos\//);
          expect(PUBLISHED_PACKAGES.has(name), `${name} is not in the 0.9.0 release surface`).toBe(
            true,
          );
        }

        const main = page.locator('main');
        for (const unpublished of UNPUBLISHED) {
          await expect(main).not.toContainText(unpublished);
        }
        await expect(packageMap).toContainText('published at 0.9.0');
      });

      test('states the three boundaries', async ({ page }) => {
        await page.goto(spec.path);

        const boundaries = page.locator('[data-boundary]');
        await expect(boundaries).toHaveCount(3);

        const titles = await boundaries.locator('.boundary__title').allTextContents();
        expect(titles).toEqual(spec.boundaries);
      });

      test('lists runnable examples with their proofs and GitHub sources', async ({ page }) => {
        await page.goto(spec.path);

        const examples = page.locator('[data-example]');
        await expect(examples).toHaveCount(3);

        for (const name of spec.examples) {
          const card = examples.filter({ hasText: name });

          await expect(card.locator('h3 code')).toHaveText(name);
          expect((await card.locator('.example__proof').innerText()).length).toBeGreaterThan(40);
          await expect(card.getByRole('link', { name: /View source on GitHub/ })).toHaveAttribute(
            'href',
            `${EXAMPLE_TREE}/${name}`,
          );
        }
      });

      test('code block comes from an example, links its source, and copies verbatim', async ({
        page,
        context,
      }) => {
        await context.grantPermissions(['clipboard-read', 'clipboard-write']);
        await page.goto(spec.path);

        const codeBlock = page.locator('[data-code-block]');
        await expect(codeBlock).toHaveCount(1);

        const code = await codeBlock.locator('pre code').textContent();
        expect(code).toBeTruthy();
        const lines = (code ?? '').split('\n');
        expect(lines.length).toBe(spec.code.lines);
        expect(lines.length).toBeGreaterThanOrEqual(5);
        expect(lines.length).toBeLessThanOrEqual(15);
        for (const snippet of spec.code.contains) {
          expect(code).toContain(snippet);
        }

        await expect(
          codeBlock.getByRole('link', { name: spec.code.filename }),
        ).toHaveAttribute('href', spec.code.sourceHref);

        await codeBlock.getByRole('button', { name: 'Copy code' }).click();
        await expect(codeBlock.getByText('Copied', { exact: true })).toBeVisible();
        expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(code);
      });

      test('FAQ uses native details and toggles open and closed', async ({ page }) => {
        await page.goto(spec.path);

        const items = page.locator('[data-faq-item]');
        await expect(items).toHaveCount(3);

        const questions = await items.locator('summary').allTextContents();
        expect(questions).toEqual(spec.faqs);

        const first = await openFirstFaq(page);
        await first.locator('summary').click();
        await expect(first).not.toHaveAttribute('open', '');
      });

      test('ends with the Quickstart and GitHub CTA and carries no customer proof', async ({
        page,
      }) => {
        await page.goto(spec.path);

        const cta = page.locator('main [data-block="cta"]');
        await expect(cta).toHaveCount(1);
        await expect(page.locator('main [data-block]').last()).toHaveAttribute('data-block', 'cta');
        await expect(cta.getByRole('heading', { level: 2 })).toHaveText(spec.cta);
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

      const boundaryClaims = spec.boundaryClaims;

      if (boundaryClaims && boundaryClaims.length > 0) {
        test('states the page-specific boundary claims', async ({ page }) => {
          await page.goto(spec.path);

          const main = page.locator('main');
          for (const claim of boundaryClaims) {
            await expect(main).toContainText(claim);
          }
        });
      }

      test.describe('responsive layout', () => {
        test.use({ viewport: { width: 1440, height: 900 } });

        test('lays the reference architecture out as one row of nodes', async ({ page }) => {
          await page.goto(spec.path);

          const columns = await columnCount(page.locator('[data-architecture-flow]'));

          expect(columns).toBe(spec.architecture.nodes.length);
        });

        test('keeps the architecture readable down to the tablet breakpoint', async ({ page }) => {
          await page.goto(spec.path);

          for (const width of [1024, 1280]) {
            await page.setViewportSize({ width, height: 900 });

            const overflow = await page
              .locator('[data-architecture-flow]')
              .evaluate((flow) => flow.scrollWidth > flow.clientWidth + 1);
            expect(overflow, `${spec.path} at ${width}px`).toBe(false);
          }

          await page.setViewportSize({ width: 768, height: 900 });

          const columns = await columnCount(page.locator('[data-architecture-flow]'));
          expect(columns, `${spec.path} at 768px`).toBe(1);
        });
      });

      test.describe('tablet', () => {
        test.use({ viewport: { width: 900, height: 900 } });

        test('lays the card grids out two-up between 768 and 1023', async ({ page }) => {
          await page.goto(spec.path);

          for (const selector of ['.scenario-cards__grid', '.examples__grid', '.boundaries__grid']) {
            expect(await columnCount(page.locator(selector)), selector).toBe(2);
          }
        });
      });

      test.describe('narrow mobile', () => {
        test.use({ viewport: { width: 320, height: 800 } });

        test('does not overflow the page horizontally', async ({ page }) => {
          await page.goto(spec.path);

          const { scrollWidth, clientWidth } = await page.evaluate(() => ({
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
          }));

          expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
        });
      });
    });

    test.describe(`${spec.path} without JavaScript`, () => {
      test.use({ javaScriptEnabled: false });

      test('opens the FAQ with native details semantics', async ({ page }) => {
        await page.goto(spec.path);

        await openFirstFaq(page);
      });
    });
  }
}
