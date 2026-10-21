import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  BLOCK_REGISTRY,
  ctaBlockSchema,
  proseBlockSchema,
  validateBlockRegistry,
} from '../../src/lib/blocks.ts';
import { marketingSchema } from '../../src/lib/marketing.ts';
import {
  containsHtmlStructure,
  projectBlock,
  projectPageMarkdown,
} from '../../src/lib/markdown-projector.ts';

const validEntry = {
  route: '/about/',
  title: 'About — Oribos',
  description: 'About the Oribos umbrella brand and product family.',
  h1: 'About Oribos',
  family: 'company',
  seo: {
    jsonLd: ['Organization', 'BreadcrumbList'],
  },
  sections: [
    {
      type: 'prose',
      heading: 'What Oribos is',
      body: 'Oribos is the umbrella brand for an open-source agent framework.',
    },
    {
      type: 'cta',
      heading: 'Build with Oribos.',
      body: 'Read the documentation or explore the source.',
      actions: [
        { label: 'Read the docs', href: '/docs/' },
        { label: 'GitHub', href: 'https://github.com/0xnicholas/oribos-framework', external: true },
      ],
    },
  ],
};

function parseValid() {
  return marketingSchema.parse(validEntry);
}

function without(value: Record<string, unknown>, key: string): Record<string, unknown> {
  const copy = { ...value };
  delete copy[key];
  return copy;
}

test('marketing schema accepts a complete entry', () => {
  const entry = parseValid();

  assert.equal(entry.route, '/about/');
  assert.equal(entry.family, 'company');
  assert.equal(entry.sections.length, 2);
  assert.equal(entry.seo.noindex, false);
});

test('marketing schema rejects a missing route, title, description, family, or sections', () => {
  for (const field of ['route', 'title', 'description', 'family', 'sections']) {
    const result = marketingSchema.safeParse(without(validEntry, field));

    assert.equal(result.success, false, `expected a missing ${field} to fail`);
  }
});

test('marketing schema rejects a missing H1', () => {
  const result = marketingSchema.safeParse(without(validEntry, 'h1'));

  assert.equal(result.success, false);
});

test('marketing schema requires SEO fields', () => {
  assert.equal(marketingSchema.safeParse(without(validEntry, 'seo')).success, false);
  assert.equal(marketingSchema.safeParse({ ...validEntry, seo: {} }).success, false);
});

test('marketing schema requires route paths with a leading and trailing slash', () => {
  for (const route of ['about', 'about/', '/about', '/About/', '//about/']) {
    const result = marketingSchema.safeParse({ ...validEntry, route });

    assert.equal(result.success, false, `expected ${route} to fail`);
  }

  for (const route of ['/', '/about/', '/privacy-policy/', '/docs-guide/']) {
    const result = marketingSchema.safeParse({ ...validEntry, route });

    assert.equal(result.success, true, `expected ${route} to pass`);
  }
});

test('marketing schema rejects an unknown family', () => {
  const result = marketingSchema.safeParse({ ...validEntry, family: 'docs' });

  assert.equal(result.success, false);
});

test('marketing schema rejects an empty section list and unknown block types', () => {
  assert.equal(marketingSchema.safeParse({ ...validEntry, sections: [] }).success, false);

  const unknownBlock = marketingSchema.safeParse({
    ...validEntry,
    sections: [{ type: 'hero', heading: 'Compose AI agents.' }],
  });

  assert.equal(unknownBlock.success, false);
});

test('prose blocks require a Markdown body', () => {
  assert.equal(proseBlockSchema.safeParse({ type: 'prose', body: '' }).success, false);
  assert.equal(proseBlockSchema.safeParse({ type: 'prose' }).success, false);
  assert.equal(
    proseBlockSchema.safeParse({ type: 'prose', heading: 'Scope', body: 'Markdown body.' }).success,
    true,
  );
});

test('call-to-action blocks require at least one action', () => {
  assert.equal(ctaBlockSchema.safeParse({ type: 'cta', heading: 'Start', actions: [] }).success, false);
  assert.equal(
    ctaBlockSchema.safeParse({
      type: 'cta',
      heading: 'Start',
      actions: [{ label: 'Docs', href: '/docs/' }],
    }).success,
    true,
  );
});

test('the block registry covers prose and call-to-action with renderers and projectors', () => {
  assert.deepEqual(validateBlockRegistry(), []);
  assert.ok(BLOCK_REGISTRY.prose);
  assert.ok(BLOCK_REGISTRY.cta);

  for (const definition of Object.values(BLOCK_REGISTRY)) {
    assert.equal(typeof definition.renderer, 'string');
    assert.ok(definition.renderer.length > 0);
    assert.equal(typeof definition.projectMarkdown, 'function');
  }
});

test('the block registry test fails when a renderer is missing', () => {
  const failures = validateBlockRegistry({
    prose: {
      type: 'prose',
      schema: BLOCK_REGISTRY.prose.schema,
      renderer: '',
      projectMarkdown: BLOCK_REGISTRY.prose.projectMarkdown,
    },
  });

  assert.ok(failures.some((failure) => failure.includes('renderer')));
});

test('the block registry test fails when a projector is missing', () => {
  const failures = validateBlockRegistry({
    cta: {
      type: 'cta',
      schema: BLOCK_REGISTRY.cta.schema,
      renderer: BLOCK_REGISTRY.cta.renderer,
    },
  });

  assert.ok(failures.some((failure) => failure.includes('projectMarkdown')));
});

test('prose Markdown projects verbatim while CTA projects headings and links', () => {
  const entry = parseValid();
  const prose = entry.sections[0];
  const cta = entry.sections[1];

  assert.equal(projectBlock(prose), '## What Oribos is\n\nOribos is the umbrella brand for an open-source agent framework.');
  assert.equal(
    projectBlock(cta),
    '## Build with Oribos.\n\nRead the documentation or explore the source.\n\n[Read the docs](/docs/) · [GitHub](https://github.com/0xnicholas/oribos-framework)',
  );
});

test('the page Markdown projection emits no HTML structure or component tags', () => {
  const markdown = projectPageMarkdown(parseValid());

  assert.match(markdown, /^# About Oribos/m);
  assert.match(markdown, /## What Oribos is/);
  assert.match(markdown, /\[Read the docs\]\(\/docs\/\)/);
  assert.equal(containsHtmlStructure(markdown), false);
});

test('the Markdown-only gate catches HTML tags and comments but allows autolinks', () => {
  assert.equal(containsHtmlStructure('<div>block</div>'), true);
  assert.equal(containsHtmlStructure('<ProseBlock />'), true);
  assert.equal(containsHtmlStructure('<!-- comment -->'), true);
  assert.equal(containsHtmlStructure('<https://example.com>'), false);
  assert.equal(containsHtmlStructure('<person@example.com>'), false);
  assert.equal(containsHtmlStructure('[link](https://example.com)'), false);
});
