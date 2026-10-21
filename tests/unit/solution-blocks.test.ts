import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  BLOCK_REGISTRY,
  boundariesBlockSchema,
  codeBlockSchema,
  examplesBlockSchema,
  faqBlockSchema,
  packageMapBlockSchema,
  referenceArchitectureBlockSchema,
  scenarioCardsBlockSchema,
  validateBlockRegistry,
} from '../../src/lib/blocks.ts';
import { marketingSchema } from '../../src/lib/marketing.ts';
import {
  containsHtmlStructure,
  projectBlock,
  projectPageMarkdown,
} from '../../src/lib/markdown-projector.ts';

const EXAMPLE_BASE = 'https://github.com/0xnicholas/oribos-framework/tree/main/examples';

const scenarioCards = {
  type: 'scenarioCards',
  heading: 'Three ways teams add an agent',
  intro: 'Each card is a path through the same host application.',
  cards: [
    {
      name: 'Answer, streamed into your UI',
      body: 'A route speaks the AI SDK stream. Memory is the conversation authority. The client keeps rendering.',
      packages: ['@oribos/core/agent', '@oribos/core/memory', '@oribos/ai-sdk'],
      example: { label: 'ai-chat-route', href: `${EXAMPLE_BASE}/ai-chat-route` },
      docs: { label: 'Agents', href: '/docs/concepts/agents/' },
    },
  ],
};

const referenceArchitecture = {
  type: 'referenceArchitecture',
  heading: 'Where the agent lives',
  body: 'The agent stays inside the application you operate.',
  flow: [
    { label: 'Host UI', detail: 'Your existing interface.' },
    { label: 'AI SDK route', detail: '`@oribos/ai-sdk` translates the stream.' },
    { label: 'Durable agent', detail: 'The loop holds gated calls.' },
    { label: 'Memory store', detail: 'Thread history behind a port.' },
  ],
  tools: { label: 'Your API as tools', detail: 'Endpoints become tools with schemas.' },
  gate: { label: 'Approval gate', detail: 'Side effects wait for a resume.' },
  caption: 'Reference architecture, not a deployment diagram.',
};

const packageMap = {
  type: 'packageMap',
  heading: 'Packages on this path',
  intro: 'Install only what you use.',
  packages: [
    { name: '@oribos/core', role: 'Core', purpose: 'Agents, memory, tools, and the approval gate.' },
    { name: '@oribos/ai-sdk', role: 'Capability', purpose: 'The AI SDK message stream.' },
  ],
  note: 'Every package here is published at 0.9.0.',
};

const boundaries = {
  type: 'boundaries',
  heading: 'What Oribos is not',
  intro: 'These are deliberate.',
  items: [
    { title: 'Not a chat product', body: 'The interface belongs to your application.' },
    { title: 'Not a hosted service', body: 'You deploy the route where your app runs.' },
  ],
};

const examples = {
  type: 'examples',
  heading: 'Runnable evidence',
  intro: 'Each example asserts its own payoff.',
  items: [
    {
      name: 'ai-chat-route',
      proves: 'A useChat-compatible route streams and resumes a run.',
      href: `${EXAMPLE_BASE}/ai-chat-route`,
    },
  ],
};

const code = {
  type: 'code',
  heading: 'One route, one durable run',
  language: 'ts',
  filename: 'examples/ai-chat-route/src/index.ts',
  code: [
    'const route = createChatRoute({',
    '  agent: durable,',
    "  identity: () => ({ resource: THREAD.resource }),",
    '});',
    '',
    'const server = createServer(route);',
  ].join('\n'),
  source: {
    label: 'examples/ai-chat-route/src/index.ts',
    href: `${EXAMPLE_BASE.replace('/tree/', '/blob/')}/ai-chat-route/src/index.ts`,
  },
};

const faq = {
  type: 'faq',
  heading: 'Questions this page raises',
  items: [
    { q: 'Do I have to replace my chat UI?', a: 'No. The route speaks the AI SDK stream.' },
    { q: 'Does Oribos host the agent?', a: 'No. There is no managed runtime.' },
    { q: 'Where do auth and data live?', a: 'In your application.' },
  ],
};

const cta = {
  type: 'cta',
  heading: 'Build it into your app.',
  actions: [{ label: 'Quickstart', href: '/docs/get-started/quickstart/' }],
};

const validEntry = {
  route: '/customer-facing-agents/',
  title: 'Customer-facing agents — Oribos',
  description: 'Add an agent to the app your customers already use.',
  h1: 'Customer-facing agents',
  eyebrow: 'SOLUTIONS · CUSTOMER-FACING',
  positioning: 'Answer your users, act inside your product, hand off to a human.',
  family: 'solutions',
  seo: { jsonLd: ['BreadcrumbList'] },
  sections: [
    scenarioCards,
    referenceArchitecture,
    packageMap,
    boundaries,
    examples,
    code,
    faq,
    cta,
  ],
};

function project(sections: typeof validEntry.sections): string {
  return sections.map((section) => projectBlock(section as never)).join('\n\n');
}

test('a solution entry accepts the eyebrow, positioning, and full block set', () => {
  const entry = marketingSchema.parse(validEntry);

  assert.equal(entry.eyebrow, 'SOLUTIONS · CUSTOMER-FACING');
  assert.equal(entry.positioning, 'Answer your users, act inside your product, hand off to a human.');
  assert.equal(entry.sections.length, 8);
});

test('the block registry covers every solution block with a renderer and projector', () => {
  assert.deepEqual(validateBlockRegistry(), []);

  const solutionTypes = [
    'scenarioCards',
    'referenceArchitecture',
    'packageMap',
    'boundaries',
    'examples',
    'code',
    'faq',
  ] as const;

  for (const type of solutionTypes) {
    assert.ok(BLOCK_REGISTRY[type], `missing registry entry for ${type}`);
    assert.equal(typeof BLOCK_REGISTRY[type].renderer, 'string');
    assert.equal(typeof BLOCK_REGISTRY[type].projectMarkdown, 'function');
  }
});

test('scenario cards require a name, body, packages, example, and docs link', () => {
  assert.equal(scenarioCardsBlockSchema.safeParse(scenarioCards).success, true);

  for (const field of ['name', 'body', 'packages', 'example', 'docs']) {
    const card: Record<string, unknown> = { ...scenarioCards.cards[0] };
    delete card[field];
    const result = scenarioCardsBlockSchema.safeParse({ ...scenarioCards, cards: [card] });

    assert.equal(result.success, false, `expected a missing ${field} to fail`);
  }

  assert.equal(
    scenarioCardsBlockSchema.safeParse({ ...scenarioCards, cards: [] }).success,
    false,
  );
});

test('reference architecture requires an ordered flow, tools, and an approval gate', () => {
  assert.equal(referenceArchitectureBlockSchema.safeParse(referenceArchitecture).success, true);
  assert.equal(
    referenceArchitectureBlockSchema.safeParse({ ...referenceArchitecture, flow: [] }).success,
    false,
  );
  assert.equal(
    referenceArchitectureBlockSchema.safeParse({ ...referenceArchitecture, tools: undefined })
      .success,
    false,
  );
  assert.equal(
    referenceArchitectureBlockSchema.safeParse({ ...referenceArchitecture, gate: undefined })
      .success,
    false,
  );
});

test('package map requires at least one package and a role', () => {
  assert.equal(packageMapBlockSchema.safeParse(packageMap).success, true);
  assert.equal(
    packageMapBlockSchema.safeParse({ ...packageMap, packages: [] }).success,
    false,
  );
  assert.equal(
    packageMapBlockSchema.safeParse({
      ...packageMap,
      packages: [{ name: '@oribos/core', purpose: 'Core.' }],
    }).success,
    false,
  );
});

test('boundaries require a title and body per item', () => {
  assert.equal(boundariesBlockSchema.safeParse(boundaries).success, true);
  assert.equal(boundariesBlockSchema.safeParse({ ...boundaries, items: [] }).success, false);
  assert.equal(
    boundariesBlockSchema.safeParse({ ...boundaries, items: [{ title: 'Only a title' }] })
      .success,
    false,
  );
});

test('examples require a name, proof, and source link', () => {
  assert.equal(examplesBlockSchema.safeParse(examples).success, true);
  assert.equal(examplesBlockSchema.safeParse({ ...examples, items: [] }).success, false);
  assert.equal(
    examplesBlockSchema.safeParse({
      ...examples,
      items: [{ name: 'ai-chat-route', proves: 'It proves the route.' }],
    }).success,
    false,
  );
});

test('code blocks require a language, filename, source, and five to fifteen lines', () => {
  assert.equal(codeBlockSchema.safeParse(code).success, true);

  for (const lines of [4, 16]) {
    const result = codeBlockSchema.safeParse({
      ...code,
      code: Array.from({ length: lines }, (_, index) => `line ${index}`).join('\n'),
    });

    assert.equal(result.success, false, `expected ${lines} lines to fail`);
  }

  for (const lines of [5, 15]) {
    const result = codeBlockSchema.safeParse({
      ...code,
      code: Array.from({ length: lines }, (_, index) => `line ${index}`).join('\n'),
    });

    assert.equal(result.success, true, `expected ${lines} lines to pass`);
  }

  assert.equal(codeBlockSchema.safeParse({ ...code, language: '' }).success, false);
  assert.equal(codeBlockSchema.safeParse({ ...code, source: undefined }).success, false);
});

test('FAQ blocks require at least one question and answer', () => {
  assert.equal(faqBlockSchema.safeParse(faq).success, true);
  assert.equal(faqBlockSchema.safeParse({ ...faq, items: [] }).success, false);
  assert.equal(
    faqBlockSchema.safeParse({ ...faq, items: [{ q: 'Question only?' }] }).success,
    false,
  );
});

test('solution Markdown projects sections without HTML structure', () => {
  const markdown = project(validEntry.sections);

  assert.match(markdown, /## Three ways teams add an agent/);
  assert.match(markdown, /### Answer, streamed into your UI/);
  assert.match(markdown, /`@oribos\/ai-sdk`/);
  assert.match(markdown, /\[ai-chat-route\]\(https:\/\/github\.com\/0xnicholas\/oribos-framework\/tree\/main\/examples\/ai-chat-route\)/);
  assert.match(markdown, /1\. \*\*Host UI\*\*/);
  assert.match(markdown, /4\. \*\*Memory store\*\*/);
  assert.match(markdown, /\*\*Your API as tools\.\*\*/);
  assert.match(markdown, /\*\*Approval gate\.\*\*/);
  assert.match(markdown, /\| Package \| Role \| What it gives you \|/);
  assert.match(markdown, /\| `@oribos\/core` \| Core \|/);
  assert.match(markdown, /- \*\*Not a chat product\.\*\*/);
  assert.match(markdown, /### ai-chat-route/);
  assert.match(markdown, /```ts\nconst route = createChatRoute\(\{/);
  assert.match(markdown, /### Do I have to replace my chat UI\?/);
  assert.equal(containsHtmlStructure(markdown), false);
});

test('page Markdown keeps the eyebrow and positioning above the sections', () => {
  const markdown = projectPageMarkdown(marketingSchema.parse(validEntry));
  const lines = markdown.split('\n');

  assert.equal(lines[0], '# Customer-facing agents');
  assert.equal(lines[2], '**SOLUTIONS · CUSTOMER-FACING**');
  assert.equal(
    lines[4],
    'Answer your users, act inside your product, hand off to a human.',
  );
  assert.equal(containsHtmlStructure(markdown), false);
});
