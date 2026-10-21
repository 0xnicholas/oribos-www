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

const linkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  external: z.boolean().default(false),
});

export const scenarioCardsBlockSchema = z.object({
  type: z.literal('scenarioCards'),
  heading: z.string().min(1),
  intro: z.string().min(1).optional(),
  cards: z
    .array(
      z.object({
        name: z.string().min(1),
        body: z.string().min(1),
        packages: z.array(z.string().min(1)).min(1),
        example: linkSchema,
        docs: linkSchema,
      }),
    )
    .min(1),
});

export const referenceArchitectureBlockSchema = z.object({
  type: z.literal('referenceArchitecture'),
  heading: z.string().min(1),
  body: z.string().min(1).optional(),
  flow: z
    .array(
      z.object({
        label: z.string().min(1),
        detail: z.string().min(1),
      }),
    )
    .min(2),
  tools: z.object({
    label: z.string().min(1),
    detail: z.string().min(1),
  }),
  gate: z.object({
    label: z.string().min(1),
    detail: z.string().min(1),
  }),
  caption: z.string().min(1).optional(),
});

export const packageMapBlockSchema = z.object({
  type: z.literal('packageMap'),
  heading: z.string().min(1),
  intro: z.string().min(1).optional(),
  packages: z
    .array(
      z.object({
        name: z.string().min(1),
        role: z.string().min(1),
        purpose: z.string().min(1),
      }),
    )
    .min(1),
  note: z.string().min(1).optional(),
});

export const boundariesBlockSchema = z.object({
  type: z.literal('boundaries'),
  heading: z.string().min(1),
  intro: z.string().min(1).optional(),
  items: z
    .array(
      z.object({
        title: z.string().min(1),
        body: z.string().min(1),
      }),
    )
    .min(1),
});

export const examplesBlockSchema = z.object({
  type: z.literal('examples'),
  heading: z.string().min(1),
  intro: z.string().min(1).optional(),
  items: z
    .array(
      z.object({
        name: z.string().min(1),
        proves: z.string().min(1),
        href: z.string().min(1),
      }),
    )
    .min(1)
    .max(3),
});

const codeLines = (value: string): number => value.split('\n').length;

export const codeBlockSchema = z.object({
  type: z.literal('code'),
  heading: z.string().min(1),
  language: z.string().min(1),
  filename: z.string().min(1),
  code: z
    .string()
    .min(1)
    .refine((value) => codeLines(value) >= 5 && codeLines(value) <= 15, {
      message: 'code must be between 5 and 15 lines',
    }),
  source: linkSchema,
});

export const faqBlockSchema = z.object({
  type: z.literal('faq'),
  heading: z.string().min(1),
  intro: z.string().min(1).optional(),
  items: z
    .array(
      z.object({
        q: z.string().min(1),
        a: z.string().min(1),
      }),
    )
    .min(1),
});

export const blockSchema = z.discriminatedUnion('type', [
  proseBlockSchema,
  ctaBlockSchema,
  scenarioCardsBlockSchema,
  referenceArchitectureBlockSchema,
  packageMapBlockSchema,
  boundariesBlockSchema,
  examplesBlockSchema,
  codeBlockSchema,
  faqBlockSchema,
]);

export type ProseBlock = z.infer<typeof proseBlockSchema>;
export type CtaBlock = z.infer<typeof ctaBlockSchema>;
export type ScenarioCardsBlock = z.infer<typeof scenarioCardsBlockSchema>;
export type ReferenceArchitectureBlock = z.infer<typeof referenceArchitectureBlockSchema>;
export type PackageMapBlock = z.infer<typeof packageMapBlockSchema>;
export type BoundariesBlock = z.infer<typeof boundariesBlockSchema>;
export type ExamplesBlock = z.infer<typeof examplesBlockSchema>;
export type CodeBlock = z.infer<typeof codeBlockSchema>;
export type FaqBlock = z.infer<typeof faqBlockSchema>;
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

function projectScenarioCardsBlock(block: ScenarioCardsBlock): string {
  const cards = block.cards.map((card) => {
    const packages = card.packages.map((name) => `\`${name}\``).join(' · ');
    const links = [
      `- Example: [${card.example.label}](${card.example.href})`,
      `- Docs: [${card.docs.label}](${card.docs.href})`,
    ].join('\n');

    return [`### ${card.name}`, card.body.trim(), `**Packages:** ${packages}`, links].join('\n\n');
  });

  return [`## ${block.heading}`, block.intro?.trim(), ...cards].filter(Boolean).join('\n\n');
}

function projectReferenceArchitectureBlock(block: ReferenceArchitectureBlock): string {
  const flow = block.flow
    .map((step, index) => `${index + 1}. **${step.label}** — ${step.detail.trim()}`)
    .join('\n');
  const edges = [
    `**${block.tools.label}.** ${block.tools.detail.trim()}`,
    `**${block.gate.label}.** ${block.gate.detail.trim()}`,
  ].join('\n\n');

  return [
    `## ${block.heading}`,
    block.body?.trim(),
    flow,
    edges,
    block.caption?.trim(),
  ]
    .filter(Boolean)
    .join('\n\n');
}

function projectPackageMapBlock(block: PackageMapBlock): string {
  const rows = block.packages
    .map((entry) => `| \`${entry.name}\` | ${entry.role} | ${entry.purpose} |`)
    .join('\n');
  const table = ['| Package | Role | What it gives you |', '| --- | --- | --- |', rows].join('\n');

  return [`## ${block.heading}`, block.intro?.trim(), table, block.note?.trim()]
    .filter(Boolean)
    .join('\n\n');
}

function projectBoundariesBlock(block: BoundariesBlock): string {
  const items = block.items
    .map((item) => `- **${item.title}.** ${item.body.trim()}`)
    .join('\n');

  return [`## ${block.heading}`, block.intro?.trim(), items].filter(Boolean).join('\n\n');
}

function projectExamplesBlock(block: ExamplesBlock): string {
  const items = block.items
    .map((item) =>
      [`### ${item.name}`, item.proves.trim(), `[View source on GitHub](${item.href})`].join('\n\n'),
    )
    .join('\n\n');

  return [`## ${block.heading}`, block.intro?.trim(), items].filter(Boolean).join('\n\n');
}

function projectCodeBlock(block: CodeBlock): string {
  return [
    `## ${block.heading}`,
    `\`\`\`${block.language}\n${block.code}\n\`\`\``,
    `[${block.source.label}](${block.source.href})`,
  ].join('\n\n');
}

function projectFaqBlock(block: FaqBlock): string {
  const items = block.items
    .map((item) => `### ${item.q}\n\n${item.a.trim()}`)
    .join('\n\n');

  return [`## ${block.heading}`, block.intro?.trim(), items].filter(Boolean).join('\n\n');
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
  scenarioCards: {
    type: 'scenarioCards',
    schema: scenarioCardsBlockSchema,
    renderer: 'ScenarioCardsBlock',
    projectMarkdown: projectScenarioCardsBlock,
  } satisfies BlockDefinition<ScenarioCardsBlock>,
  referenceArchitecture: {
    type: 'referenceArchitecture',
    schema: referenceArchitectureBlockSchema,
    renderer: 'ReferenceArchitectureBlock',
    projectMarkdown: projectReferenceArchitectureBlock,
  } satisfies BlockDefinition<ReferenceArchitectureBlock>,
  packageMap: {
    type: 'packageMap',
    schema: packageMapBlockSchema,
    renderer: 'PackageMapBlock',
    projectMarkdown: projectPackageMapBlock,
  } satisfies BlockDefinition<PackageMapBlock>,
  boundaries: {
    type: 'boundaries',
    schema: boundariesBlockSchema,
    renderer: 'BoundariesBlock',
    projectMarkdown: projectBoundariesBlock,
  } satisfies BlockDefinition<BoundariesBlock>,
  examples: {
    type: 'examples',
    schema: examplesBlockSchema,
    renderer: 'ExamplesBlock',
    projectMarkdown: projectExamplesBlock,
  } satisfies BlockDefinition<ExamplesBlock>,
  code: {
    type: 'code',
    schema: codeBlockSchema,
    renderer: 'CodeBlock',
    projectMarkdown: projectCodeBlock,
  } satisfies BlockDefinition<CodeBlock>,
  faq: {
    type: 'faq',
    schema: faqBlockSchema,
    renderer: 'FaqBlock',
    projectMarkdown: projectFaqBlock,
  } satisfies BlockDefinition<FaqBlock>,
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
