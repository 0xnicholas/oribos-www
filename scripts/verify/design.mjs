import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

import { sourceExtensions, walkFiles } from './lib.mjs';

const root = new URL('../../', import.meta.url).pathname;
const tokensPath = join(root, 'src/styles/tokens.css');
const failures = [];

const requiredTokens = [
  '--surface-0',
  '--surface-1',
  '--surface-2',
  '--surface-3',
  '--border-hairline',
  '--border-strong',
  '--text-1',
  '--text-2',
  '--text-3',
  '--text-inv',
  '--accent',
  '--accent-hover',
  '--accent-text',
  '--accent-fill',
  '--accent-fill-hover',
  '--accent-low',
  '--accent-inv',
  '--focus-ring',
  '--selection-bg',
  '--selection-text',
  '--code-bg',
  '--syntax-keyword',
  '--syntax-string',
  '--syntax-function',
  '--syntax-comment',
  '--status-success',
  '--status-success-low',
  '--status-warning',
  '--status-warning-low',
  '--status-danger',
  '--status-danger-low',
  '--status-info',
  '--status-info-low',
];

const textPairs = [
  ...['surface-0', 'surface-1', 'surface-2', 'surface-3'].flatMap((surface) => [
    ['text-1', surface],
    ['text-2', surface],
    ['text-3', surface],
  ]),
  ...['surface-0', 'surface-1', 'surface-2', 'surface-3'].map((surface) => ['accent-text', surface]),
  ['accent-text', 'accent-low'],
  ['text-1', 'accent-low'],
  ['accent-inv', 'accent-fill'],
  ['accent-inv', 'accent-fill-hover'],
  ['selection-text', 'selection-bg'],
  ['syntax-keyword', 'code-bg'],
  ['syntax-string', 'code-bg'],
  ['syntax-function', 'code-bg'],
  ['syntax-comment', 'code-bg'],
  ['status-success', 'surface-0'],
  ['status-success', 'status-success-low'],
  ['status-warning', 'surface-0'],
  ['status-warning', 'status-warning-low'],
  ['status-danger', 'surface-0'],
  ['status-danger', 'status-danger-low'],
  ['status-info', 'surface-0'],
  ['status-info', 'status-info-low'],
];

const nonTextPairs = [
  ['focus-ring', 'surface-0'],
  ['border-strong', 'surface-0'],
  ['border-strong', 'surface-3'],
  ['accent', 'surface-0'],
  ['accent', 'surface-1'],
];

const tokenName = (name) => (name.startsWith('--') ? name : `--${name}`);

function fail(message) {
  failures.push(message);
}

function declarations(block) {
  const counts = new Map();

  for (const match of block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    const values = counts.get(match[1]) ?? [];
    values.push(match[2].trim());
    counts.set(match[1], values);
  }

  return counts;
}

function resolveValue(name, values, seen = new Set()) {
  const token = tokenName(name);
  const candidates = values.get(token);

  if (!candidates || candidates.length === 0) {
    return undefined;
  }

  if (candidates.length > 1) {
    fail(`${token} is declared ${candidates.length} times in one theme`);
    return undefined;
  }

  if (seen.has(token)) {
    fail(`circular token reference: ${[...seen, token].join(' -> ')}`);
    return undefined;
  }

  const value = candidates[0];
  const reference = value.match(/^var\(\s*(--[\w-]+)\s*\)$/);

  if (reference) {
    seen.add(token);
    return resolveValue(reference[1], values, seen);
  }

  return value;
}

function parseColor(value) {
  const match = value?.match(/^#([0-9a-f]{3,8})$/i);

  if (!match) {
    return undefined;
  }

  let hex = match[1];

  if (hex.length === 3 || hex.length === 4) {
    hex = [...hex].map((character) => character.repeat(2)).join('');
  }

  if (hex.length !== 6 && hex.length !== 8) {
    return undefined;
  }

  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
  };
}

function luminance({ r, g, b }) {
  const channel = (value) => {
    const normalized = value / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(foreground, background) {
  const first = luminance(foreground);
  const second = luminance(background);
  const [lighter, darker] = first > second ? [first, second] : [second, first];

  return (lighter + 0.05) / (darker + 0.05);
}

const tokens = await readFile(tokensPath, 'utf8');
const themeBlocks = [...tokens.matchAll(/(^:root|^\[data-theme="light"\])\s*\{([\s\S]*?)^\}/gm)];
const darkBlock = themeBlocks.find((match) => match[1] === ':root' && match[2].includes('--surface-0:'));
const lightBlock = themeBlocks.find((match) => match[1] === '[data-theme="light"]');

if (!darkBlock) {
  fail('tokens.css is missing the dark :root token block');
}

if (!lightBlock) {
  fail('tokens.css is missing the [data-theme="light"] token block');
}

if (darkBlock && lightBlock) {
  const dark = declarations(darkBlock[2]);
  const light = declarations(lightBlock[2]);
  const declaredThemes = { dark, light };
  const resolvedThemes = {
    dark,
    light: new Map([...dark, ...light]),
  };

  for (const [theme, values] of Object.entries(declaredThemes)) {
    for (const [token, declarationsForToken] of values) {
      if (declarationsForToken.length > 1) {
        fail(`${theme} theme declares ${token} ${declarationsForToken.length} times`);
      }
    }
  }

  for (const token of requiredTokens) {
    for (const [theme, values] of Object.entries(declaredThemes)) {
      if (!values.has(token)) {
        fail(`${theme} theme is missing semantic token ${token}`);
      }
    }
  }

  for (const [theme, values] of Object.entries(resolvedThemes)) {
    const checkPair = ([foreground, background], minimum) => {
      const foregroundValue = resolveValue(foreground, values);
      const backgroundValue = resolveValue(background, values);
      const foregroundColor = parseColor(foregroundValue);
      const backgroundColor = parseColor(backgroundValue);

      if (!foregroundColor || !backgroundColor) {
        fail(
          `${theme} theme cannot resolve ${tokenName(foreground)} (${foregroundValue ?? 'missing'}) on ${tokenName(background)} (${backgroundValue ?? 'missing'})`,
        );
        return;
      }

      const ratio = contrastRatio(foregroundColor, backgroundColor);

      if (ratio < minimum) {
        fail(
          `${theme} theme ${tokenName(foreground)} on ${tokenName(background)} is ${ratio.toFixed(2)}:1, expected at least ${minimum}:1`,
        );
      }
    };

    for (const pair of textPairs) {
      checkPair(pair, 4.5);
    }

    for (const pair of nonTextPairs) {
      checkPair(pair, 3);
    }
  }

  const favicon = await readFile(join(root, 'public/favicon.svg'), 'utf8');
  const faviconHexes = new Set(
    [...favicon.matchAll(/#[0-9a-f]{6}\b/gi)].map((match) => match[0].toLowerCase()),
  );
  const requiredFaviconHexes = [
    ['dark', resolveValue('surface-1', resolvedThemes.dark)],
    ['dark', resolveValue('accent', resolvedThemes.dark)],
    ['light', resolveValue('surface-0', resolvedThemes.light)],
    ['light', resolveValue('accent', resolvedThemes.light)],
  ];

  for (const [theme, value] of requiredFaviconHexes) {
    if (!value || !faviconHexes.has(value.toLowerCase())) {
      fail(`public/favicon.svg is missing the ${theme} token color ${value ?? '(unresolved)'}`);
    }
  }

  for (const forbidden of ['#9e630a', '#ea9f2e']) {
    if (faviconHexes.has(forbidden)) {
      fail(`public/favicon.svg uses the retired amber color ${forbidden}`);
    }
  }
}

for (const file of await walkFiles(join(root, 'src'), sourceExtensions)) {
  if (file === tokensPath) {
    continue;
  }

  const source = await readFile(file, 'utf8');
  const displayPath = relative(root, file);

  for (const { name, pattern } of [
    { name: 'hex color', pattern: /#[0-9a-fA-F]{3,8}\b/ },
    { name: 'rgb()/hsl()/oklch() color', pattern: /\b(?:rgba?|hsla?|oklch)\(/ },
  ]) {
    if (pattern.test(source)) {
      fail(`${displayPath} contains a bare ${name}`);
    }
  }

  for (const match of source.matchAll(/border-radius\s*:\s*([^;]+);/g)) {
    if (!/^0(?:px)?(?:\s+0(?:px)?){0,3}$/.test(match[1].trim())) {
      fail(`${displayPath} uses a non-zero border-radius: ${match[1].trim()}`);
    }
  }

  for (const property of ['box-shadow', 'filter', 'backdrop-filter']) {
    for (const match of source.matchAll(new RegExp(`(?<![-\\w])${property}\\s*:\\s*([^;]+);`, 'g'))) {
      if (match[1].trim() !== 'none') {
        fail(`${displayPath} uses ${property}: ${match[1].trim()}`);
      }
    }
  }

  for (const match of source.matchAll(/(?<![-\w])transform\s*:\s*([^;]+);/g)) {
    if (match[1].trim() !== 'none') {
      fail(`${displayPath} uses transform: ${match[1].trim()}`);
    }
  }

  for (const match of source.matchAll(/(?<![-\w])transition[^:]*:\s*([^;]+);/g)) {
    if (/\b(?:transform|translate|scale|rotate)\b/.test(match[1])) {
      fail(`${displayPath} transitions a transform property: ${match[1].trim()}`);
    }
  }

  if (/url\(\s*['"]?(?:https?:)?\/\//i.test(source)) {
    fail(`${displayPath} references an external URL in CSS`);
  }
}

const expectedAssets = [
  {
    path: join(root, 'public/fonts/inter-latin-wght-normal.woff2'),
    bytes: 48256,
    sha256: '3100e775e8616cd2611beecfa23a4263d7037586789b43f035236a2e6fbd4c62',
  },
  {
    path: join(root, 'public/fonts/inter-OFL.txt'),
    bytes: 4380,
    sha256: '262481e844521b326f5ecd053e59b98c8b2da78c8ee1bdbb6e8174305e54935a',
  },
];

for (const asset of expectedAssets) {
  const displayPath = relative(root, asset.path);

  try {
    const file = await readFile(asset.path);
    const details = await stat(asset.path);
    const digest = createHash('sha256').update(file).digest('hex');

    if (details.size !== asset.bytes) {
      fail(`${displayPath} is ${details.size} bytes, expected ${asset.bytes}`);
    }

    if (digest !== asset.sha256) {
      fail(`${displayPath} SHA-256 is ${digest}, expected ${asset.sha256}`);
    }
  } catch {
    fail(`${displayPath} is missing`);
  }
}

if (failures.length > 0) {
  console.error('Design verification failed:');
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log(
  `Design verification passed: ${requiredTokens.length} semantic tokens in both themes, ${textPairs.length} text contrast pairs at 4.5:1, ${nonTextPairs.length} non-text pairs at 3:1, favicon hexes, and font hashes.`,
);
