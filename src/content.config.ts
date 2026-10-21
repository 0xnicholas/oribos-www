import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

import { marketingSchema } from './lib/marketing.ts';

export const collections = {
  marketing: defineCollection({
    loader: glob({ pattern: '**/*.json', base: './src/content/marketing' }),
    schema: marketingSchema,
  }),
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
};
