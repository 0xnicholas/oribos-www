import { z } from 'astro/zod';

import { blockSchema } from './blocks.ts';

export const MARKETING_FAMILIES = [
  'home',
  'company',
  'legal',
  'solutions',
  'keyword',
  'product',
  'support',
  'resources',
] as const;

export const JSON_LD_TYPES = [
  'Organization',
  'WebSite',
  'BreadcrumbList',
  'FAQPage',
  'SoftwareApplication',
] as const;

const routeSchema = z
  .string()
  .regex(
    /^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*\/)*$/,
    'route must be a lowercase path with a trailing slash',
  );

export const marketingSeoSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  canonical: z.string().min(1).optional(),
  ogImage: z.string().min(1).optional(),
  ogImageAlt: z.string().min(1).optional(),
  jsonLd: z.array(z.enum(JSON_LD_TYPES)),
  faq: z
    .array(
      z.object({
        q: z.string().min(1),
        a: z.string().min(1),
      }),
    )
    .optional(),
  updated: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'updated must be an ISO date (YYYY-MM-DD)')
    .optional(),
  noindex: z.boolean().default(false),
});

export const marketingSchema = z.object({
  route: routeSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  h1: z.string().min(1),
  eyebrow: z.string().min(1).optional(),
  positioning: z.string().min(1).optional(),
  family: z.enum(MARKETING_FAMILIES),
  seo: marketingSeoSchema,
  sections: z.array(blockSchema).min(1),
});

export type MarketingEntryData = z.infer<typeof marketingSchema>;
export type MarketingFamily = (typeof MARKETING_FAMILIES)[number];
