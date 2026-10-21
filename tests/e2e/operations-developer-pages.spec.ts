import { expect, test } from '@playwright/test';

import { expectNoCustomerProof, sentenceCount } from './solution-helpers';

const EXAMPLE_TREE = 'https://github.com/0xnicholas/oribos-framework/tree/main/examples';
const EXAMPLE_BLOB = 'https://github.com/0xnicholas/oribos-framework/blob/main/examples';

interface Scenario {
  name: string;
  packages: string[];
  example: string;
  docs: string;
}

interface PageSpec {
  path: string;
  h1: string;
  eyebrow: string;
  positioning: string;
  scenarios: Scenario[];
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
}

const PAGES: PageSpec[] = [
  {
    path: '/operations-agents/',
    h1: 'Operations agents',
    eyebrow: 'SOLUTIONS · OPERATIONS',
    positioning: 'Agents that handle the busywork around your team — with a human on the risky steps.',
    scenarios: [
      {
        name: 'Use the MCP tools you already run',
        packages: ['@oribos/mcp-client', '@oribos/core/tools'],
        example: 'mcp-tools',
        docs: '/docs/concepts/tools/',
      },
      {
        name: 'Put a human on the risky step',
        packages: ['@oribos/core/durable-agent', '@oribos/sqlite'],
        example: 'durable-approval',
        docs: '/docs/concepts/suspend-resume/',
      },
      {
        name: 'Wake on a schedule or a signal',
        packages: [
          '@oribos/core/schedules',
          '@oribos/croner',
          '@oribos/background-tasks',
        ],
        example: 'cron-schedule',
        docs: '/docs/guides/signals-desk/',
      },
    ],
    architecture: {
      nodes: [
        'Cron, signal, or webhook',
        'Agent',
        'MCP tools',
        'Approval gate',
        'Snapshot store',
      ],
      edgeLabels: ['Where the human sits', 'Delivery semantics'],
      toolsText: 'Approval is a decision on the run, not an inbox.',
      gateText: 'at-least-once',
      caption:
        'Reference architecture, not a deployment diagram. Oribos runs no worker; the trigger endpoint and the snapshot store are yours.',
    },
    packages: [
      '@oribos/core',
      '@oribos/mcp-client',
      '@oribos/background-tasks',
      '@oribos/distributed-signals',
      '@oribos/sqlite',
    ],
    boundaries: [
      'Not an always-on worker',
      'Not a workflow SaaS',
      'Not a replacement for your operations tooling',
    ],
    examples: ['mcp-tools', 'durable-approval', 'cron-schedule'],
    code: {
      filename: 'examples/cron-schedule/src/index.ts',
      sourceHref: `${EXAMPLE_BLOB}/cron-schedule/src/index.ts#L114-L120`,
      lines: 7,
      contains: [
        "const definition = cron('0 9 * * *', { timezone: 'Asia/Shanghai' });",
        'const record = await schedules.save({',
        "target: { agent: 'reporter', input: 'write the daily report' },",
      ],
    },
    faqs: [
      'Does this need a worker running all the time?',
      'What happens when the process dies mid-run?',
      'Do I have to move my operations tools into Oribos?',
    ],
    cta: 'Put an agent on the busywork.',
  },
  {
    path: '/developer-infrastructure/',
    h1: 'Developer infrastructure',
    eyebrow: 'SOLUTIONS · DEVELOPER INFRASTRUCTURE',
    positioning: 'Ship primitives other teams build on — each team installs only what it uses.',
    scenarios: [
      {
        name: 'Primitives, not a platform',
        packages: ['@oribos/core', '@oribos/core/agent', '@oribos/core/tools'],
        example: 'minimal-agent',
        docs: '/docs/reference/import-map/',
      },
      {
        name: 'Trace into the stack you already run',
        packages: ['@oribos/core/observability', '@oribos/otlp', '@oribos/otel-bridge'],
        example: 'otlp-collector',
        docs: '/docs/concepts/observability/',
      },
      {
        name: 'Publish an agent as shared infrastructure',
        packages: ['@oribos/mcp-server', '@oribos/mcp-client'],
        example: 'mcp-tools',
        docs: '/docs/concepts/tools/',
      },
    ],
    architecture: {
      nodes: ['Product teams', 'Core subpaths', 'Capability packages', 'MCP endpoint'],
      edgeLabels: ['Traces through @oribos/otlp', 'Your collector'],
      toolsText: 'GenAI semantic conventions',
      gateText: 'Your OTLP collector',
      caption:
        'Reference architecture, not a deployment diagram. The collector, version policy, and release cadence belong to the platform team.',
    },
    packages: [
      '@oribos/core',
      '@oribos/otlp',
      '@oribos/otel-bridge',
      '@oribos/mcp-server',
    ],
    boundaries: [
      'Not a hosted platform',
      'Not a replacement for your observability stack',
      'Not a monolith',
    ],
    examples: ['minimal-agent', 'otlp-collector', 'mcp-tools'],
    code: {
      filename: 'examples/otlp-collector/src/index.ts',
      sourceHref: `${EXAMPLE_BLOB}/otlp-collector/src/index.ts#L220-L230`,
      lines: 11,
      contains: [
        'const tracer = createTracer({ exporters: [exporter] });',
        'const app = createApp({ tracer });',
        "tools: { checkOrder: checkOrderTool() },",
      ],
    },
    faqs: [
      'Do product teams have to adopt the whole framework?',
      'Does Oribos provide a dashboard for traces?',
      'Where does the platform boundary sit?',
    ],
    cta: 'Give every team the same small surface.',
  },
];

const UNPUBLISHED = [
  '@oribos/lease',
  '@oribos/testing',
  '@balsats/',
  '@oribos/core/agent-run',
  '@oribos/core/output-object',
];

for (const spec of PAGES) {
  test.describe(`${spec.path} solution page`, () => {
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
      await page.goto(spec.path);

      const cta = page.locator('main [data-block="cta"]');
      await expect(cta).toHaveCount(1);
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

    test.describe('responsive layout', () => {
      test.use({ viewport: { width: 1440, height: 900 } });

      test('lays the reference architecture out as one row of nodes', async ({ page }) => {
        await page.goto(spec.path);

        const columns = await page
          .locator('[data-architecture-flow]')
          .evaluate((flow) => getComputedStyle(flow).gridTemplateColumns.split(' ').filter(Boolean).length);

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

        const columns = await page
          .locator('[data-architecture-flow]')
          .evaluate((flow) => getComputedStyle(flow).gridTemplateColumns.split(' ').filter(Boolean).length);
        expect(columns, `${spec.path} at 768px`).toBe(1);
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
}

for (const spec of PAGES) {
  test.describe(`${spec.path} without JavaScript`, () => {
    test.use({ javaScriptEnabled: false });

    test('opens the FAQ with native details semantics', async ({ page }) => {
      await page.goto(spec.path);

      const first = page.locator('[data-faq-item]').first();
      await expect(first).not.toHaveAttribute('open', '');
      await first.locator('summary').click();
      await expect(first).toHaveAttribute('open', '');
      await expect(first.locator('.faq__answer')).toBeVisible();
    });
  });
}
