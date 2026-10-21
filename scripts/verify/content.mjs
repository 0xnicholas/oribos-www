import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

import { BLOCK_REGISTRY, validateBlockRegistry } from '../../src/lib/blocks.ts';
import { marketingSchema } from '../../src/lib/marketing.ts';
import { containsHtmlStructure, projectPageMarkdown } from '../../src/lib/markdown-projector.ts';

const root = new URL('../../', import.meta.url).pathname;
const marketingDir = join(root, 'src/content/marketing');
const rendererDir = join(root, 'src/components/marketing/blocks');
const failures = [];

for (const failure of validateBlockRegistry()) {
  failures.push(failure);
}

for (const [type, definition] of Object.entries(BLOCK_REGISTRY)) {
  if (typeof definition.renderer !== 'string' || definition.renderer.length === 0) {
    continue;
  }

  const rendererPath = join(rendererDir, `${definition.renderer}.astro`);

  try {
    await stat(rendererPath);
  } catch {
    failures.push(
      `block "${type}" names HTML renderer "${definition.renderer}" but ${relative(root, rendererPath)} is missing`,
    );
  }
}

let files = [];

try {
  files = (await readdir(marketingDir)).filter((file) => file.endsWith('.json')).sort();
} catch {
  failures.push('src/content/marketing is missing');
}

if (files.length === 0) {
  failures.push('no marketing entries found');
}

const routes = new Map();

for (const file of files) {
  const path = join(marketingDir, file);
  const displayPath = relative(root, path);
  let raw;

  try {
    raw = JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    failures.push(`${displayPath}: invalid JSON (${error.message})`);
    continue;
  }

  const parsed = marketingSchema.safeParse(raw);

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      failures.push(`${displayPath}: ${issue.path.join('.') || '(root)'}: ${issue.message}`);
    }
    continue;
  }

  const entry = parsed.data;

  if (routes.has(entry.route)) {
    failures.push(
      `${displayPath}: route ${entry.route} is already declared by ${routes.get(entry.route)}`,
    );
  } else {
    routes.set(entry.route, displayPath);
  }

  if (entry.route === '/docs/' || entry.route.startsWith('/docs/')) {
    failures.push(`${displayPath}: marketing route ${entry.route} collides with /docs/`);
  }

  for (const [index, block] of entry.sections.entries()) {
    const definition = BLOCK_REGISTRY[block.type];

    if (!definition) {
      failures.push(`${displayPath}: section ${index + 1} uses unknown block "${block.type}"`);
      continue;
    }

    if (typeof definition.renderer !== 'string' || definition.renderer.length === 0) {
      failures.push(`${displayPath}: block "${block.type}" has no HTML renderer`);
    }

    if (typeof definition.projectMarkdown !== 'function') {
      failures.push(`${displayPath}: block "${block.type}" has no Markdown projector`);
    }
  }

  const markdown = projectPageMarkdown(entry);

  if (containsHtmlStructure(markdown)) {
    failures.push(`${displayPath}: Markdown projection contains HTML structure or a component tag`);
  }
}

if (failures.length > 0) {
  console.error('Content verification failed:');
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log(
  `Content verification passed: ${files.length} marketing entries validated against the schema, ${Object.keys(BLOCK_REGISTRY).length} registered blocks have HTML renderers and Markdown projectors, and every projection is Markdown-only.`,
);
