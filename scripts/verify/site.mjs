import { readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

import { sourceExtensions, walkFiles } from './lib.mjs';

const root = new URL('../../', import.meta.url).pathname;
const failures = [];

const provisional = await import(`../../astro.config.mjs?provisional=${Date.now()}`);
if (provisional.SITE_ORIGIN !== 'https://oribos.ai') {
  failures.push(`provisional origin is ${provisional.SITE_ORIGIN}`);
}

process.env.SITE_ORIGIN = 'https://example.test/some/path';

const overridden = await import(`../../astro.config.mjs?override=${Date.now()}`);
if (overridden.SITE_ORIGIN !== 'https://example.test') {
  failures.push(`SITE_ORIGIN override resolved to ${overridden.SITE_ORIGIN}`);
}

const astroConfig = await readFile(join(root, 'astro.config.mjs'), 'utf8');
if (!astroConfig.includes('process.env.SITE_ORIGIN')) {
  failures.push('astro.config.mjs does not read the SITE_ORIGIN environment override');
}

const siteModule = await readFile(join(root, 'src/lib/site.ts'), 'utf8');
if (!siteModule.includes("from 'astro:config/server'") || !siteModule.includes('export const SITE_ORIGIN')) {
  failures.push('src/lib/site.ts does not derive SITE_ORIGIN from the resolved site config');
}

for (const file of await walkFiles(join(root, 'src'), sourceExtensions)) {
  const source = await readFile(file, 'utf8');

  if (/oribos\.ai/i.test(source)) {
    failures.push(`${relative(root, file)} hardcodes the site origin`);
  }
}

if (failures.length > 0) {
  console.error('Site origin verification failed:');
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log('Site origin verification passed: one source, environment override resolves, no source hardcoding.');
