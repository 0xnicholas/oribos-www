import { z } from 'astro/zod';

export const proseBlockSchema = z.object({
  type: z.literal('prose'),
  heading: z.string().min(1).optional(),
  body: z.string().min(1),
});

export const ctaBlockSchema = z.object({
  type: z.literal('cta'),
  heading: z.string().min(1),
  body: z.string().min(1).optional(),
  actions: z
    .array(
      z.object({
        label: z.string().min(1),
        href: z.string().min(1),
        variant: z.enum(['primary', 'secondary', 'text']).default('primary'),
        external: z.boolean().default(false),
      }),
    )
    .min(1),
});

export const blockSchema = z.discriminatedUnion('type', [proseBlockSchema, ctaBlockSchema]);

export type ProseBlock = z.infer<typeof proseBlockSchema>;
export type CtaBlock = z.infer<typeof ctaBlockSchema>;
export type Block = z.infer<typeof blockSchema>;
export type BlockType = Block['type'];

export interface BlockDefinition<TBlock extends Block = Block> {
  type: TBlock['type'];
  schema: z.ZodType<TBlock>;
  renderer: string;
  projectMarkdown: (block: TBlock) => string;
}

function projectProseBlock(block: ProseBlock): string {
  const body = block.body.trim();

  return block.heading ? `## ${block.heading}\n\n${body}` : body;
}

function projectCtaBlock(block: CtaBlock): string {
  const links = block.actions.map((action) => `[${action.label}](${action.href})`).join(' · ');

  return [block.heading && `## ${block.heading}`, block.body?.trim(), links].filter(Boolean).join('\n\n');
}

export const BLOCK_REGISTRY = {
  prose: {
    type: 'prose',
    schema: proseBlockSchema,
    renderer: 'ProseBlock',
    projectMarkdown: projectProseBlock,
  } satisfies BlockDefinition<ProseBlock>,
  cta: {
    type: 'cta',
    schema: ctaBlockSchema,
    renderer: 'CtaBlock',
    projectMarkdown: projectCtaBlock,
  } satisfies BlockDefinition<CtaBlock>,
};

interface BlockRegistryEntry {
  type?: unknown;
  schema?: unknown;
  renderer?: unknown;
  projectMarkdown?: unknown;
}

export function validateBlockRegistry(
  registry: Record<string, BlockRegistryEntry> = BLOCK_REGISTRY,
): string[] {
  const failures: string[] = [];
  const entries = Object.entries(registry);

  if (entries.length === 0) {
    failures.push('block registry is empty');
  }

  for (const [type, definition] of entries) {
    if (!definition) {
      failures.push(`block "${type}" has no definition`);
      continue;
    }

    if (definition.type !== type) {
      failures.push(`block "${type}" declares type "${String(definition.type)}"`);
    }

    if (!definition.schema) {
      failures.push(`block "${type}" is missing a schema`);
    }

    if (typeof definition.renderer !== 'string' || definition.renderer.length === 0) {
      failures.push(`block "${type}" is missing an HTML renderer`);
    }

    if (typeof definition.projectMarkdown !== 'function') {
      failures.push(`block "${type}" is missing a Markdown projector (projectMarkdown)`);
    }
  }

  return failures;
}
