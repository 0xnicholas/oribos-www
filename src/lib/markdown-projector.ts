import { BLOCK_REGISTRY, type Block } from './blocks.ts';
import type { MarketingEntryData } from './marketing.ts';

const HTML_TAG_PATTERN = /<\/?([a-zA-Z][^>]*)>/g;
const HTML_DECLARATION_PATTERN = /<!--|<!doctype/i;

export function containsHtmlStructure(markdown: string): boolean {
  if (HTML_DECLARATION_PATTERN.test(markdown)) {
    return true;
  }

  for (const match of markdown.matchAll(HTML_TAG_PATTERN)) {
    const body = match[1];

    if (/^(?:https?:|mailto:)/i.test(body)) {
      continue;
    }

    if (/^[^<>\s]+@[^<>\s]+$/.test(body)) {
      continue;
    }

    return true;
  }

  return false;
}

export function projectBlock(block: Block): string {
  const definition = BLOCK_REGISTRY[block.type] as unknown as
    | { projectMarkdown?: (value: Block) => string }
    | undefined;

  if (!definition || typeof definition.projectMarkdown !== 'function') {
    throw new Error(
      `No Markdown projector registered for block "${(block as { type: string }).type}"`,
    );
  }

  return definition.projectMarkdown(block);
}

export function projectPageMarkdown(entry: MarketingEntryData): string {
  return [`# ${entry.h1}`, ...entry.sections.map(projectBlock)].join('\n\n') + '\n';
}
